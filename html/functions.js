let bLocalRun;
$(document).ready(function () {
    // Check if running locally or on the server so we can hide the API key if online
    if (typeof openai_apikey === 'undefined') {
        bLocalRun = false;
    } else {
        bLocalRun = true;
    }
    // Populate agent dropdown
    const agentSelect = $("#agent");
    for (const agentKey in agents) {
        const option = $("<option></option>");
        option.val(agentKey);
        option.text(agentKey);
        agentSelect.append(option);
    }
    // Populate model dropdown
    const modelSelect = $("#model");
    for (const modelKey in models) {
        const option = $("<option></option>");
        option.val(modelKey);
        option.text(models[modelKey].text);
        modelSelect.append(option);
    }
    // Add event listeners
    agentSelect.on("change", function () {
        const agent = agents[agentSelect.val()];
        $("#systemprompt").val(agent.sysprompt);
        $("#agentHeading").text(agentSelect.val() + " (" + modelSelect.val() + ")");
        $("#agentDescription").text(agent.description);
    });
    modelSelect.on("change", function () {
        $("#agentHeading").text(agentSelect.val() + " (" + modelSelect.val() + ")");
    });
    $("#but_AddToHistory").click(function () {
        const newtext = $("#userprompt").val();
        const outputText = $("#response").val();
	console.log("USER: " + newtext + "\n\nASSISTANT: " + outputText + "\n\n");
        $("#history").val($("#history").val() + "USER: " + newtext + "\n\nASSISTANT: " + outputText + "\n\n");
        $("#userprompt").val("");
        $("#response").val("");
        $("#history").scrollTop($("#history")[0].scrollHeight);
    });
    $("#but_send").click(async function () {
        const model = $("#model").val();
        const history = $("#history").val();
        const systemprompt = $("#systemprompt").val();
        const userprompt = $("#userprompt").val();
        const max_tokens = parseInt($("#max_tokens").val());
        const temperature = parseFloat($("#temperature").val());

        // Input Validation
        if (!model || isNaN(temperature)) {
        //if (!model || isNaN(max_tokens) || isNaN(temperature)) {
        //if (!model || !history || !systemprompt || !userprompt || isNaN(max_tokens) || isNaN(temperature)) {
            alert("Please fill in model and temperature before sending.");
            return;
        }

        // Error Handling and API Request
        try {
            await doSend(model, systemprompt, history, userprompt, max_tokens, temperature, bLocalRun);
        } catch (error) {
            console.error(error);
            let errorMessage = "An error occurred.";
            // Append error object
            errorMessage += "\n" + JSON.stringify(error);

            alert(errorMessage);
            // Enable the SEND button again
            $("#but_send").prop("disabled", false);
            $("#but_send").text("SEND");
        }
    });
    $("#but_ClearHistory").click(function () {
        $("#history").val("");
    });
    $("#but_ClearPrompt").click(function () {
        $("#userprompt").val("");
    });
    $("#but_ClearResponse").click(function () {
        $("#response").val("");
    });
    //-----------------end of event listeners
    agentSelect.trigger("change");//updates system prompt text here at start
});

async function doSend(myModel, mySystemprompt, myHistory, myUserprompt, max_tokens, temperature, bLocalRun) {
    const url = bLocalRun ? 'https://api.openai.com/v1/chat/completions' : 'apicall.php';
    const messages = myHistory + "USER: " + myUserprompt;
    $("#but_send").text("WAIT...");
    $("#but_send").prop("disabled", true);

    let ajaxSettings = {
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            model: myModel,
            messages: [
                {
                    role: "system",
                    content: mySystemprompt
                },
                {
                    role: "user",
                    content: messages
                }
            ],
            max_tokens: max_tokens,
            n: 1,
            stop: null,
            temperature: temperature
        }),
    };

    if (bLocalRun) {
        ajaxSettings.beforeSend = function (xhr) {
            xhr.setRequestHeader("Authorization", `Bearer ${openai_apikey}`);
        };
    }

    try {
        const response = await $.ajax(ajaxSettings);
        doReturn(response);
    } catch (error) {
        console.error(error);
        let errorMessage = "An error occurred.";
        // Append error object
        errorMessage += "\n" + JSON.stringify(error);

        alert(errorMessage);
        // Enable the SEND button again
        $("#but_send").prop("disabled", false);
        $("#but_send").text("SEND");
        throw error;
    } finally {
        // Prevent Potential Memory Leaks by removing event listeners and clearing fields
        $("#but_send").off("click");
        // $("#but_AddToHistory").off("click");
        // $("#but_ClearHistory").off("click");
        // $("#but_ClearPrompt").off("click");
        $("#but_send").click(async function () {
            const model = $("#model").val();
            const history = $("#history").val();
            const systemprompt = $("#systemprompt").val();
            const userprompt = $("#userprompt").val();
            const max_tokens = parseInt($("#max_tokens").val());
            const temperature = parseFloat($("#temperature").val());

            // Input Validation
            if (!model || isNaN(temperature)) {
            //if(!model || !history || !systemprompt || !userprompt || isNaN(max_tokens) || isNaN(temperature)) {
                alert("Please fill in all fields with valid data before sending.");
                return;
            }

            // Error Handling and API Request
            try {
                await doSend(model, systemprompt, history, userprompt, max_tokens, temperature, bLocalRun);
            } catch (error) {
                console.error(error);
                let errorMessage = "An error occurred.";
                // Append error object
                errorMessage += "\n" + JSON.stringify(error);
                alert(errorMessage);
            }
        });
        $("#but_send").text("SEND");
        $("#but_send").prop("disabled", false);
        // $("#userprompt").val("");
        // $("#response").val("");
        // $("#history").val("");
    }
}

function CheckmessageContent(msg) {
    // If the start of msg is "ASSISTANT: " then remove it
    if (msg.startsWith("ASSISTANT: ")) {
        msg = msg.substring(11);
    }
    return msg;
}

function doReturn(response) {
    try {
        // Cruel hack I know but it works until better code arrives ;)
        const test = response.choices[0].finish_reason;
    } catch (error) {
        console.log("ERROR:", response);
        alert(response.message);
        // Enable the SEND button again
        $("#but_send").prop("disabled", false);
        $("#but_send").text("SEND");
        throw error;
    }

    const finReason = response.choices[0].finish_reason;
    let messageContent = response.choices[0].message.content;
    const totalTokens = response.usage.total_tokens;
    /*
    const id = response.id;
    const created = response.created;
    const model = response.model;
    const completionTokens = response.usage.completion_tokens;
    const promptTokens = response.usage.prompt_tokens;

    console.log("messageContent: ", messageContent);
    console.log("id: ", id);
    console.log("created: ", created);
    console.log("model: ", model);
    console.log("completionTokens: ", completionTokens);
    console.log("promptTokens: ", promptTokens);
    */

    console.log("response", response); // Full response object
    console.log("totalTokens: ", totalTokens);
    console.log("finishReason: ", finReason);
    messageContent = CheckmessageContent(messageContent);
    $("#response").val(messageContent);
    const modeltokens = models[$("#model").val()].tokens;
    const msg = "Total tokens used: " + totalTokens + " of " + modeltokens + " | Finish reason: " + finReason;
    $("#ResponseInNumbers").text(msg);
}

