<!-- PROJECT SHIELDS -->
<!--
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Language][language-shield]][language-url]
[![LinkedIn][linkedin-shield]][linkedin-url]


<!-- PROJECT LOGO -->
<br />
<p align="center">
  <!--
  <a href="https://github.com/gannochenko/gbelt">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>
  -->

  <h3 align="center">😱 + 😰 + 😅 = 😎</h3>
  <h3 align="center">GitHub Trick</h3>

  <p align="center">
    In two-three words write here what this package does
    <!--
    <br />
    <a href="https://github.com/gannochenko/gbelt"><strong>Explore the docs »</strong></a>
    -->
    <br />
    <br />
    <!--
    <a href="https://gannochenko.github.io/gbelt">View Demo</a>
    ·
    -->
    <a href="https://github.com/gannochenko/gbelt/issues">Report Bug</a>
    ·
    <a href="https://github.com/gannochenko/gbelt/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)

  * [Installation](#installation)

* [Usage](#usage)
* [Development](#development)
  * [Development prerequisites](#development-prerequisites)
  * [Development Installation](#development-installation)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Built With](#built-with)



<!-- ABOUT THE PROJECT -->
## About The Project

https://www.conventionalcommits.org/en/v1.0.0/

<!--
[![Preview Screen Shot][product-screenshot]](https://example.com)
-->

In more than three words tell what this package does and how it works.

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* [Node](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/)
* [Yarn](https://yarnpkg.com/lang/en/docs/install/)


### Installation

To install the tool globally:

~~~bash
yarn add @gannochenko/gbelt -g;
~~~

Or, if you want you use it only for the current user:

~~~bash
mkdir ~/.node;
yarn global add @gannochenko/gbelt --prefix ~/.node;
echo "\nexport PATH=${PATH}:${HOME}/.node/bin\n" >> ~/.bash_profile;
source ~/.bash_profile;
~~~


<!-- USAGE -->
## Usage


Just go to the repository you want to have a new version for, and type there:

~~~bash
gbelt -h;
~~~


<!-- DEVELOPMENT -->
## Development

### Development prerequisites

* [Node](https://nodesource.com/blog/installing-node-js-tutorial-using-nvm-on-mac-os-x-and-ubuntu/)
* [Yarn](https://yarnpkg.com/lang/en/docs/install/)

### Development installation

1. Clone the repo
```sh
git clone https://github.com/gannochenko/gbelt.git
```
2. Install NPM packages
```sh
cd gbelt;
yarn;
```
3. Run the application
```sh
yarn start;
```

<!-- ROADMAP -->
## Roadmap

* bugfixing :)

See the [open issues](https://github.com/gannochenko/gbelt/issues) for a list of proposed features (and known issues).

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact

Sergei Gannochenko - [Linkedin](https://www.linkedin.com/in/gannochenko/)

Project Link: [https://github.com/gannochenko/gbelt](https://github.com/gannochenko/gbelt)

<!-- BUILT WITH -->
### Built With

* [TypeScript](http://www.typescriptlang.org/)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/gannochenko/gbelt.svg?style=flat-square
[contributors-url]: https://github.com/gannochenko/gbelt/graphs/contributors
[language-shield]: https://img.shields.io/github/languages/top/gannochenko/gbelt.svg?style=flat-square
[language-url]: https://github.com/gannochenko/gbelt
[forks-shield]: https://img.shields.io/github/forks/gannochenko/gbelt.svg?style=flat-square
[forks-url]: https://github.com/gannochenko/gbelt/network/members
[stars-shield]: https://img.shields.io/github/stars/gannochenko/gbelt.svg?style=flat-square
[stars-url]: https://github.com/gannochenko/gbelt/stargazers
[issues-shield]: https://img.shields.io/github/issues/gannochenko/gbelt.svg?style=flat-square
[issues-url]: https://github.com/gannochenko/gbelt/issues
[license-shield]: https://img.shields.io/github/license/gannochenko/gbelt.svg?style=flat-square
[license-url]: https://github.com/gannochenko/gbelt/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/sergey-gannochenko/
[product-screenshot]: images/screenshot.png
