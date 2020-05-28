# Heuristics Setup on Chrome for Mac OS

Open a Terminal application from `Applications/Utilities`. You will need this terminal session during the entire installation, so it is best to keep it open.

## System Requirements

Before the _Heuristics Engine_ can be installed, certain system requirements need to be satisfied.

### Homebrew

Install Homebrew (<https://brew.sh>) by executing the following command in Terminal:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
```

### Java 8 Runtime Environment

Run the following Homebrew commands in your Terminal to install Java 8 JRE:

```bash
brew tap adoptopenjdk/openjdk
brew cask install adoptopenjdk8-jre
```

Ensure that a Java JRE has been successfully installed using the following command:

```bash
java -version
```

The output should contain a line similar to the following:

```bash
OpenJDK Runtime Environment (AdoptOpenJDK)(build 1.8.0_252-b09)
```

### Gettext

Install `gettext` to allow our installer script to execute:

```bash
brew install gettext
brew link --force gettext
```

## Heuristics Installation

Once all of the system requirements as listed above have been satisfied, continue with the following steps:

- Download the latest heuristics build (<HERE>) and extract the file to your Desktop
- Navigate to the extracted folder in your `Terminal`
  - `bash cd ~/Desktop/tabs-0.2.0`
- Make the installer script executable by running the following
  - `chmod u+x install-mac.command`
- Execute the installer to install both the heuristics binaries and links to common browsers
  - `./install-mac.command`
