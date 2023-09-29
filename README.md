# Count LLM Tokens in your Status Bar

<a href="https://marketplace.visualstudio.com/items?itemName=marxism.ai-token-count">![](https://img.shields.io/badge/VSCode-v1.0-blue?style=flat&logo=visualstudiocode)</a>

> Do you wonder how many LLM tokens your code uses?

This extension puts the token count of the current file and the current selection right in the status bar! I needed this at work all the time, so I decided to make one for myself. I hope you find it useful too!

## Features

- **Token Count Display:** The extension provides a real-time token count of the currently selected
text or the entire document if no text is selected. The token count is displayed on the right side
of the status bar.

- **Auto-Update:** The token count is automatically updated as you edit or select text, ensuring
that the count is always accurate.

- **Easy Activation:** The extension is activated as soon as VS Code starts up. Uou don't have to
manually activate it every time you start your editor.

- **Model Selection:** The extension allows you to select the model you want to use for token
counting. The default model is the OpenAI's GPT-4 model. All OpenAI and Anthropic models are
available.

   - cl100k_base 
   - p50k_edit
   - p50k_base
   - r50k_base
   - gpt2
   - anthropic

   You can change the model by:
   1. clicking on the token count in the status bar and selecting the model you want to use.
   2. Open the Command Palette and search for `Token Count in Status Bar: Change Tokenizer`


## Requirements

- Visual Studio Code: The extension is developed for VS Code and will not work with other editors.

## Extension Settings

The extension does not add any VS Code settings.
