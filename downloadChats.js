/**
 * @file A module for downloading AI Chat data as a zip file containing markdown files.
 * @author DJ Magar <dj@deepai.org>
 */


/** Represents an error that occurs during validation of conversation data. */
class ValidationError extends Error
{
    /**
     * Creates a new ValidationError with the given message.
     * @param {string} message The error message.
     * @constructs
     * */
    constructor(message)
    {
        super(message);
        this.name = "ValidationError";
    }

    /**
     * Generates a custom error message that provides additional context and guidance
     * specific to validation errors encountered in the conversation formatting process.
     * @returns {string} A detailed error message.
     */
    getCustomErrorMessage()
    {
        return `ValidationError: ${this.message}`;
    }
}

/**
 * Retrieves the chat history by making a GET request to the server.
 * @param {string} chatUuid - The UUID of the chat session.
 * @returns {Promise<Object>} - A promise that resolves to the chat history response object.
 */
function _surrogate_getChatHistory(chatUuid)
{
    var fetchResult, chatHistoryResponse;
    return $jscomp.asyncExecutePromiseGeneratorProgram(function (_generator)
    {
        if (1 == _generator.nextAddress)
            return _generator.yield(fetch(app_base_url + "/get_chat_session?uuid=" + chatUuid, {
                credentials: "include",
                method: "GET"
            }), 2);
        if (3 != _generator.nextAddress)
            return fetchResult = _generator.yieldResult,
                _generator.yield(fetchResult.json(), 3);
        chatHistoryResponse = _generator.yieldResult;
        return _generator.return(chatHistoryResponse);
    });
}

/**
 * Fetches and processes multiple chat histories based on the given UUIDs.
 * @param {Array<string>} uuids - An array of UUIDs representing the chat histories to fetch and process.
 * @returns {Promise<void>} - A promise that resolves when all chat histories have been fetched and processed.
 */
async function fetchAndProcessChats(uuids)
{
    let _getChatHistory = (window.getChatHistory || _surrogate_getChatHistory);

    try
    {
        const chatHistories = [];
        for (let uuid of uuids)
        {
            const chatHistory = await _getChatHistory(uuid);
            if (chatHistory && chatHistory.messages)
            {
                chatHistories.push(chatHistory);
            } else
            {
                console.warn("No chat history found for UUID:", uuid);
            }
        }
        return chatHistories;
    } catch (error)
    {
        console.error("Error processing chat histories:", error);
    }
}

/**
 * Validates the structure and content of the conversation object to ensure it
 * meets expected format and requirements. Throws a ValidationError with detailed
 * information if the validation fails.
 * 
 * @param {Object} conversation The conversation data to validate.
 * @throws {ValidationError} If the conversation object is invalid.
 * @returns {void}
 */
function validateConversation(conversation)
{
    if (!conversation)
    {
        throw new ValidationError('The conversation object cannot be null or undefined.');
    }
    if (typeof conversation !== 'object' || Array.isArray(conversation))
    {
        throw new ValidationError('The conversation must be an object.');
    }
    if (!conversation.title || typeof conversation.title !== 'string')
    {
        throw new ValidationError('The conversation must have a title of type string.');
    }
    if (!Array.isArray(conversation.messages))
    {
        throw new ValidationError('The conversation.messages must be an array.');
    }
    conversation.messages.forEach((message, index) =>
    {
        if (typeof message !== 'object' || message === null || !('content' in message) || !('role' in message))
        {
            console.warn(`Skipping malformed message at index ${index} in conversation "${conversation.title}".`);
            return;
        }
    });
}

/**
 * Transforms a given conversation object into a Markdown-formatted string.
 *
 * @param {Object} conversation - An object containing the conversation details, as returned 
 * by get_chat_session endpoint. Each message object must have 'content' and 'role' properties.
 * @returns {string} The conversation formatted as a Markdown string, or an empty string if the
 * provided conversation object is invalid.
 * @throws {Error} If the conversation object is valid but the formatting fails for any reason.
 */
/**
 * Formats the conversation object to Markdown string.
 * @param {object} conversation - The conversation data object.
 * @param {boolean} [removeInvalid=true] - Whether to remove messages flagged as invalid.
 * @return {string} The formatted conversation in Markdown.
 */
function formatConversationMarkdown(conversation, removeInvalid = true)
{
    try
    {
        validateConversation(conversation);
        const title = cleanTitle(conversation.title);
        let formattedConversation = `## Conversation: ${title}\n\n`;

        formattedConversation += conversation.messages.map((message, index) =>
        {
            const rolePrefix = message.role === 'user' ? '**User:**' : '**Assistant:**';
            let content = message.content.trim() !== "" ? truncateAtCitation(message.content) : handleInvalidContent(message, index, title, removeInvalid);
            if (content)
            {
                content = formatContentAsBlockquote(content);
                return `${rolePrefix}\n${content}\n\n`;
            }
            return '';
        }).filter(part => part).join('');

        return formattedConversation;
    } catch (error)
    {
        console.error('Error formatting conversation to Markdown:', error);
        return '';
    }
}

/**
 * Handles the content of messages flagged as invalid.
 * @param {object} message - The message object.
 * @param {number} index - The index of the message in the conversation.
 * @param {string} title - The title of the conversation.
 * @param {boolean} removeInvalid - Flag to remove invalid content.
 * @return {string|null} The processed message content or null if removed.
 */
function handleInvalidContent(message, index, title, removeInvalid = true)
{
    console.warn(`Message at index ${index} in conversation "${title}" contains invalid content.`);
    return removeInvalid ? null : "(The message contains invalid content)";
}

/**
 * Cleans the title by removing leading and trailing double quotes and trimming any whitespace.
 * @param {string} title - The title to be cleaned.
 * @returns {string} - The cleaned title.
 */
function cleanTitle(title)
{
    return title.replace(/^"|"$/g, '').trim();
}

/**
 * Truncates the content at the first occurrence of a citation marker ('\u001c') and returns the truncated content.
 * If no citation marker is found, the content is returned as is.
 * @param {string} content - The content to be truncated.
 * @returns {string} The truncated content.
 */
function truncateAtCitation(content)
{
    const citationIndex = content.indexOf('\u001c');
    if (citationIndex !== -1)
    {
        return content.substring(0, citationIndex).trim();
    }
    return content.trim();
}

/**
 * Formats the content as a blockquote.
 * @param {string} content - The content to be formatted.
 * @returns {string} The formatted content as a blockquote.
 */
function formatContentAsBlockquote(content)
{
    return content.split('\n').map(line => `> ${line}`).join('\n');
}

/**
 * Loads a script dynamically and appends it to the document head.
 * If a name isn't provided, it parses the URL to get the name of the script from the last segment before the dot.
 * @param {string} src - The source URL of the script to load.
 * @param {string} [name] - An optional name for the script, used in the success log message.
 */
function loadScript(src, name)
{
    return new Promise((resolve, reject) =>
    {
        if (!name)
        {
            const urlSegments = src.split('/');
            const lastSegment = urlSegments[urlSegments.length - 1];
            name = lastSegment.split('.')[0];
        }
        console.debug(`Loading ${name}...`);
        const script = document.createElement('script');
        script.src = src;
        script.onload = () =>
        {
            console.info(`${name} loaded successfully`);
            resolve();
        };
        script.onerror = () => reject(new Error(`Failed to load script ${name}`));
        document.head.appendChild(script);
    });
}

/**
 * Prompts the user to enter a filename for the downloaded zip file.
 * If no filename is provided or it is empty, the default filename "DeepAIChats.zip" is returned.
 * If the provided filename does not end with ".zip", ".zip" is appended to the filename.
 * @returns {string} The picked filename for the downloaded zip file.
 */
function askUserForFilename(fallbackName = "DeepAIChats.zip")
{
    let pickedFilename = prompt("Please enter a filename for the downloaded zip file:", fallbackName);
    if (!pickedFilename || !pickedFilename.trim())
    {
        return fallbackName;
    }
    if (!pickedFilename.endsWith(".zip"))
    {
        pickedFilename += ".zip";
    }
    return pickedFilename.trim();
}

/**
 * Downloads chat histories as a zip file.
 * @param {Object} sessionData - The object containing an array of session objects.
 * Each session object should have a UUID and a title.
 * @returns {Promise<void>} - A promise that resolves when the download is complete.
 */
async function downloadChatsAsZip(sessionData)
{
    if (typeof JSZip === 'undefined')
    {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', 'JSZip');
    }
    const zip = new JSZip();
    const fetchPromises = sessionData.sessions.map(session =>
        getChatHistory(session.uuid).then(convo => ({ ...convo, title: session.title }))
    );

    const conversations = await Promise.all(fetchPromises).catch(error =>
    {
        console.error("Error fetching chat histories:", error);
        throw new Error("Failed to fetch chat histories");
    });

    conversations.forEach(conversation =>
    {
        const formatted = formatConversationMarkdown(conversation);
        const safeTitle = conversation.title.replace(/[<>:"\/\\|?*]+/g, '').trim();
        zip.file(`${safeTitle}.md`, formatted);
    });

    if (typeof saveAs === 'undefined')
    {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js', 'FileSaver');
    }
    const content = await zip.generateAsync({ type: "blob" });

    let fallbackFilename = "DeepAIChats.zip";
    try
    {
        const zipFilename = askUserForFilename();
        window.saveAs(content, zipFilename);
    } catch (error)
    {
        console.error("Error during file save:", error);
        window.saveAs(content, fallbackFilename);
    }
}

/**
 * Downloads the chat sessions as a zipped markdown file. (Main function)
 * @returns {Promise<void>} A promise that resolves when the download is complete.
 */
async function downloadChatsAsZippedMarkdown()
{
    chatData = await getMyChatSessionsAndConvertAnonymousSessions();
    await downloadChatsAsZip(chatData);
}

// Kick tires, light fires, etc.
downloadChatsAsZippedMarkdown();
