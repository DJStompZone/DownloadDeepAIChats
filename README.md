
# DeepAI Chat History Download Utility

## Overview

This utility provides JavaScript functions to format DeepAI's AI Chat conversations as Markdown and download them as zip files. It is designed to be used within a browser environment, and requires no additional libraries for basic formatting.

## Features

- **Validation of Conversation Data**: Ensures that each conversation object is correctly structured.
- **Markdown Formatting**: Converts conversations into human-readable Markdown format.
- **Download Chats as ZIP**: Collects all formatted chat sessions and packages them into a single ZIP file autonomously.

## How to Use

### End-to-end (Console)

1. **Copy, pasta**: Copy the contents of `downloadChats.min.js`, and and paste into your browser's console.
2. **That's it :)**

### Integration and Advanced Usage

1. **Include the Script in Your Project**: Make sure the script is included in your HTML or JavaScript project where you intend to use it.
2. **Format Conversations**: Call `formatConversationMarkdown(conversation)` to convert a conversation object into Markdown.
3. **Download Chats**: Use `downloadChatsAsZip(chatData)` to download all chats associated with the provided data as a ZIP file.
4. **Production-ready**: Invoke `downloadChatsAsZippedMarkdown()` from an event handler or similar setup for a seamless, turnkey end-to-end solution.

## Error Handling

- The script includes basic error handling for validation and operations, ensuring that any issues are logged to the console for debugging.
- A ValidationError class is provided to this end.

## Dependencies

- `JSZip` for creating ZIP files: This is loaded dynamically if not already present in the environment.
- `FileSaver.js` for saving files: Also loaded dynamically as needed.

## Example

```javascript
// Example conversation object
const exampleConversation = {
    title: "Sample Chat",
    messages: [
        { role: "user", content: "Ohi" },
        { role: "assistant", content: "Henlo yes this is dog" }
    ]
};

// Formatting conversation
const markdownContent = formatConversationMarkdown(exampleConversation);
console.log(markdownContent);

// All-in-one
downloadChatsAsZippedMarkdown();
```

## License: MIT

**Copyright 2024 DJ Magar**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


