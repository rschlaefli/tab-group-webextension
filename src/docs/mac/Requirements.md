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