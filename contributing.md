# Contributing
To setup, follow these steps:

First clone and install the needed dependencies:
```sh
git clone https://github.com/Siilwyn/vu-mods.git
cd vu-mods
npm ci
```

Then fill in the needed environment variables in a `.env.local` file. For the GitHub API token use a [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token):
```sh
cp .env.example .env.local
```

## General Prerequisites
Node.js, [latest LTS is recommended](https://nodejs.org/en/about/releases/).

## Git Commit Messages
Write the message in present tense beginning with an uppercase letter, structured like this:

```
<subject>
<BLANK LINE>
<body>
```

Example

```
Add icon to download links

Closes #1
```
