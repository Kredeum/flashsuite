<script>
  import Container from './container.svelte';
  let address;
  let network;
  let balance;
  let signer;
</script>

<Container>
  <div data-w-id="4a69aa65-f69d-177b-618b-fec329a2edbb" style="opacity:1" class="header1400container">
    <div class="headercontents left">
      <img src="images/FLSuite-Logo-Full-Dark.svg" loading="eager" width="400" id="flashSuiteLogo" alt="" class="flashsuitelogo" />
      <h4 class="textdarkmode">Flashloan DApps</h4>
      <p class="headerparagraph">without the need to write a single line of code</p>
    </div>
    <div class="headercontents right">
      <div class="headeritemcontents">
        <a id="flashPosTrigger" href="flashpos.html" class="headerbutton w-inline-block">
          <div class="frostedglasswrapper">
            <div class="frostedglasseffect" />
            <div class="blockimage"><img src="images/FlashPos-Sub-Logo-Dark.svg" loading="lazy" width="125" alt="" class="flashlogo" /></div>
          </div>
        </a>
        <p class="headerparagraph headeritemparagraph">Allows you to migrate your position, full and partially from one address to another.</p>
      </div>
      <div class="headeritemcontents">
        <a id="flashArbTrigger" href="flasharb.html" class="headerbutton w-inline-block">
          <div class="frostedglasswrapper">
            <div class="frostedglasseffect" />
            <div class="blockimage"><img src="images/FlashArb-Sub-Logo-Dark.svg" loading="lazy" width="125" alt="" class="flashlogo" /></div>
          </div>
        </a>
        <p class="headerparagraph headeritemparagraph">A graphical interface that helps you identify good arbitrage opportunities</p>
      </div>
    </div>
  </div>
</Container>

<style>
  .w-layout-grid {
    display: -ms-grid;
    display: grid;
    grid-auto-columns: 1fr;
    -ms-grid-columns: 1fr 1fr;
    grid-template-columns: 1fr 1fr;
    -ms-grid-rows: auto auto;
    grid-template-rows: auto auto;
    grid-row-gap: 16px;
    grid-column-gap: 16px;
  }

  body {
    background-color: #460456;
    font-family: Montserrat, sans-serif;
    color: #241130;
    font-size: 16px;
    line-height: 24px;
  }

  h1 {
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 24px;
    line-height: 32px;
    font-weight: 800;
  }

  h2 {
    margin-top: 0px;
    margin-bottom: 0px;
    padding-right: 0px;
    padding-left: 10px;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    -ms-grid-row-align: center;
    align-self: center;
    font-size: 20px;
    line-height: 28px;
    font-weight: 900;
  }

  h3 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 16px;
    line-height: 30px;
    font-weight: 700;
    text-align: right;
  }

  h4 {
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 18px;
    line-height: 24px;
    font-weight: 700;
  }

  p {
    display: block;
    max-width: none;
    margin: 10px 0px;
    padding-left: 0px;
    -webkit-align-self: auto;
    -ms-flex-item-align: auto;
    -ms-grid-row-align: auto;
    align-self: auto;
    -webkit-box-flex: 0;
    -webkit-flex: 0 auto;
    -ms-flex: 0 auto;
    flex: 0 auto;
    text-align: left;
  }

  a {
    text-decoration: underline;
  }

  .flashsuitelogo {
    margin-bottom: -22px;
    -webkit-align-self: flex-start;
    -ms-flex-item-align: start;
    align-self: flex-start;
  }

  .headercontents {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
  }

  .headercontents.left {
    height: 100%;
    padding-right: 20px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
  }

  .headercontents.right {
    width: 50%;
    padding-top: 100px;
    padding-left: 20px;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: end;
    -webkit-justify-content: flex-end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    -ms-grid-row-align: center;
    align-self: center;
  }

  .headerparagraph {
    padding: 0px;
    -webkit-align-self: flex-start;
    -ms-flex-item-align: start;
    align-self: flex-start;
    color: #ffe6fc;
    line-height: 22px;
  }

  .headerparagraph.headeritemparagraph {
    width: auto;
    padding-top: 10px;
    padding-right: 0px;
    padding-left: 0px;
  }

  .textdarkmode {
    margin-top: 0px;
    margin-bottom: 0px;
    color: #ffe6fc;
  }

  .textdarkmode.token {
    display: block;
    padding-left: 50px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
  }

  .textdarkmode.balance {
    display: block;
    padding-right: 20px;
    padding-left: 20px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
    font-weight: 700;
  }

  .textdarkmode.usermessage {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }

  .textdarkmode.button {
    color: #fff;
    font-weight: 700;
  }

  .headerbutton {
    overflow: hidden;
    width: 100%;
    max-width: 200px;
    min-height: auto;
    min-width: auto;
    padding: 0px;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    -ms-grid-row-align: center;
    align-self: center;
    border-style: solid;
    border-width: 2px;
    border-color: #fff;
    border-radius: 50px;
    background-color: transparent;
  }

  .frostedglasswrapper {
    position: static;
    left: auto;
    top: 0%;
    right: 0%;
    bottom: 0%;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    overflow: hidden;
    height: 45px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    border-radius: 30px;
  }

  .frostedglasswrapper.left {
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    -ms-flex-pack: start;
    justify-content: flex-start;
  }

  .frostedglasseffect {
    width: 100%;
    height: 100%;
    background-color: transparent;
    background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(246, 202, 255, 0.23)), to(rgba(246, 202, 255, 0.23))), url('../images/Synth-BG-Header-Hi.png');
    background-image: linear-gradient(180deg, rgba(246, 202, 255, 0.23), rgba(246, 202, 255, 0.23)), url('../images/Synth-BG-Header-Hi.png');
    background-position: 0px 0px, 50% 50%;
    background-size: auto, cover;
    background-repeat: repeat, no-repeat;
    background-attachment: scroll, fixed;
    -webkit-filter: blur(3px);
    filter: blur(3px);
  }

  .headeritemcontents {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: auto;
    height: 100%;
    padding: 20px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .flashlogo {
    position: static;
    top: 44px;
    z-index: 1;
  }

  .blockimage {
    position: absolute;
    z-index: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
  }

  .header1400container {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    max-width: 900px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
  }

  .navbaritems {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: auto;
    padding-top: 0px;
    padding-bottom: 0px;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: reverse;
    -webkit-flex-direction: row-reverse;
    -ms-flex-direction: row-reverse;
    flex-direction: row-reverse;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .addressblock {
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    -ms-grid-row-align: center;
    align-self: center;
  }

  .addressblock.textdarkmode {
    padding-left: 0px;
  }

  .navblockitemstrigger {
    display: block;
    width: 120px;
    height: 55px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-transition: border 200ms ease, background-color 200ms ease;
    transition: border 200ms ease, background-color 200ms ease;
    cursor: pointer;
  }

  .navblockitemstrigger:hover {
    border-bottom: 4px solid #ff500b;
    background-color: rgba(0, 0, 0, 0.22);
  }

  .navblockitemstrigger:active {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .navblockitemstrigger:focus {
    border-bottom: 4px solid #ff500b;
  }

  .navbartextblock {
    margin-top: 40px;
    margin-left: 0px;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    -ms-grid-row-align: center;
    align-self: center;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    color: #fff;
    line-height: 14px;
    text-align: center;
  }

  .navbartextblock:hover {
    background-color: transparent;
    color: #00fff2;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    text-decoration: none;
    text-transform: none;
  }

  .navlink {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 120px;
    height: 55px;
    margin-top: -40px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    color: #fff;
    text-decoration: none;
  }

  .sectionflashpos {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    height: 90vh;
    margin-top: -160px;
    margin-bottom: 0px;
    padding-right: 140px;
    padding-bottom: 60px;
    padding-left: 140px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .buttondisk {
    position: static;
    top: -0.8333px;
    right: 157.5417px;
    width: 45px;
    height: 45px;
    margin-right: 10px;
    padding-left: 0px;
    border-radius: 50px;
    background-color: #f0f0f0;
  }

  .buttondisk.dropdown {
    position: static;
    top: -1.8333px;
    right: 179.5417px;
    margin-right: 10px;
    padding-right: 0px;
  }

  .buttondisk.reverse {
    margin-right: 0px;
    margin-left: 10px;
  }

  .arrow {
    color: #ebebeb;
  }

  .arrow.lightmode {
    color: #241130;
  }

  .dropdown-toggle {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    height: 45px;
    min-width: 150px;
    padding: 0px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    border-style: solid;
    border-width: 2px;
    border-color: #fdfdfd;
    border-radius: 50px;
  }

  .dropdown-toggle.addresses {
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    border-color: #f2def5;
  }

  .sectioncontainer {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    overflow: scroll;
    width: 100%;
    height: 100vh;
    max-width: 1400px;
    margin: 60px 0px 0px;
    padding-right: 0px;
    padding-bottom: 0px;
    padding-left: 0px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
    border-radius: 20px;
    background-color: #fff;
  }

  .overlapbox {
    width: 100%;
    margin-bottom: 226px;
    padding-bottom: 0px;
  }

  .sectionbumper {
    position: relative;
    z-index: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    height: 15vh;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    border: 2px solid #f2def5;
    border-radius: 20px;
    background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(106, 20, 127, 0.95)), to(rgba(242, 222, 245, 0)));
    background-image: linear-gradient(180deg, rgba(106, 20, 127, 0.95), rgba(242, 222, 245, 0));
  }

  .sectionbumper.bottom {
    position: relative;
    left: 0%;
    top: auto;
    right: 0%;
    bottom: -73%;
    background-image: -webkit-gradient(linear, left top, left bottom, from(rgba(242, 222, 245, 0)), to(rgba(106, 20, 127, 0.95)));
    background-image: linear-gradient(180deg, rgba(242, 222, 245, 0), rgba(106, 20, 127, 0.95));
  }

  .sectionlogoimage {
    margin: 10px;
  }

  .sectioncontents {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    overflow: scroll;
    width: 100%;
    height: 100%;
    padding-top: 355px;
    padding-right: 100px;
    padding-left: 100px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .columnspositions {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
  }

  .columnposition {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    height: 100%;
    padding: 10px 0px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: stretch;
    -webkit-align-items: stretch;
    -ms-flex-align: stretch;
    align-items: stretch;
    border: 2px solid #f2def5;
    border-radius: 20px;
    background-color: transparent;
  }

  .columntitlebar {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    padding: 10px;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    -ms-flex-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .columntitlebar.reverse {
    -webkit-box-orient: horizontal;
    -webkit-box-direction: reverse;
    -webkit-flex-direction: row-reverse;
    -ms-flex-direction: row-reverse;
    flex-direction: row-reverse;
  }

  .adressdropdown {
    width: 60%;
    margin-right: 0px;
    margin-left: 0px;
  }

  .textlightmode {
    margin-top: 0px;
    margin-bottom: 0px;
    color: #241130;
  }

  .textlightmode.token {
    display: block;
    padding-left: 50px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
  }

  .textlightmode.balance {
    display: block;
    padding-right: 20px;
    padding-left: 20px;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: start;
    -webkit-align-items: flex-start;
    -ms-flex-align: start;
    align-items: flex-start;
    font-weight: 700;
  }

  .textlightmode.numbers {
    font-weight: 700;
  }

  .textlightmode.rates {
    padding-right: 0px;
    padding-left: 0px;
    color: rgba(36, 17, 48, 0.5);
    font-size: 12px;
    font-weight: 700;
    text-align: right;
  }

  .textlightmode.rates.green {
    padding-right: 5px;
    padding-left: 5px;
    color: #03ac1c;
  }

  .textlightmode.rates.red {
    padding-right: 5px;
    padding-left: 5px;
    color: #d90a0a;
  }

  .textlightmode.button {
    font-size: 14px;
    font-weight: 700;
  }

  .textlightmode.buttodarkmode {
    color: #fff;
    font-size: 14px;
    font-weight: 700;
  }

  .heading {
    margin-bottom: 0px;
  }

  .blockcontents {
    position: absolute;
    z-index: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
  }

  .dropdown-list {
    border-bottom-right-radius: 20px;
  }

  .dropdown-list.w--open {
    border: 2px solid #f2def5;
    border-bottom-left-radius: 20px;
    background-color: #fff;
  }

  .dropdownitem {
    border-radius: 20px;
    font-weight: 400;
  }


  .platformaddresslogo {
    position: static;
    top: -0.8333px;
    right: 157.5417px;
    width: 45px;
    height: 45px;
    margin-right: 10px;
    padding-right: 0px;
    border-radius: 50px;
    background-color: #f0f0f0;
  }

  .platformaddresslogo.dropdown {
    position: static;
    top: -1.8333px;
    right: 179.5417px;
    margin-right: 10px;
    padding-right: 0px;
  }

  .placeholderimage {
    width: 100%;
    overflow: hidden;
    border-radius: 30px;
  }

  .connectindicator {
    max-width: none;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    -ms-grid-row-align: center;
    align-self: center;
    -webkit-box-flex: 0;
    -webkit-flex: 0 auto;
    -ms-flex: 0 auto;
    flex: 0 auto;
  }

  .usermessagesbar {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    padding: 0px 10px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    background-color: #8a4cc6;
  }

  .usermessagesbar.orange {
    display: none;
    background-color: #d17038;
  }

  .gridorigin {
    margin-top: 10px;
    margin-bottom: 10px;
    padding-right: 10px;
    padding-left: 10px;
    -webkit-box-pack: stretch;
    -webkit-justify-content: stretch;
    -ms-flex-pack: stretch;
    justify-content: stretch;
    grid-column-gap: 10px;
    grid-row-gap: 0px;
    grid-template-areas:
      'Deposit-Ttile-Origin Loan-Title-Origin'
      'Deposit-Item-01 Loan-Item-01'
      'Empty-area APR-Rate-Info-Loan-01'
      'Deposit-Item-02 Loan-item-02'
      'Empty-Area APR-Rate-Info-Loan-02';
    -ms-grid-rows: auto 0px auto 0px minmax(15px, 1fr) 0px auto 0px minmax(15px, 1fr);
    grid-template-rows: auto auto minmax(15px, 1fr) auto minmax(15px, 1fr);
  }

  .right {
    margin-top: 0px;
    margin-bottom: 0px;
  }

  .left {
    margin-top: 0px;
    margin-bottom: 0px;
    text-align: left;
  }

  .deposititem {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    padding: 5px;
    border-radius: 10px;
    background-color: #f9f5ff;
  }

  .tokendetails {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 50%;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .tokendetails.reverse {
    -webkit-box-orient: horizontal;
    -webkit-box-direction: reverse;
    -webkit-flex-direction: row-reverse;
    -ms-flex-direction: row-reverse;
    flex-direction: row-reverse;
  }

  .readonlyfield {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 50%;
    padding: 5px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .loanitem {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    padding: 5px;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: reverse;
    -webkit-flex-direction: row-reverse;
    -ms-flex-direction: row-reverse;
    flex-direction: row-reverse;
    border-radius: 10px;
    background-color: #f8f7f8;
  }

  .griddestination {
    margin-top: 10px;
    margin-bottom: 10px;
    padding-right: 10px;
    padding-left: 10px;
    -webkit-box-pack: stretch;
    -webkit-justify-content: stretch;
    -ms-flex-pack: stretch;
    justify-content: stretch;
    grid-column-gap: 10px;
    grid-row-gap: 0px;
    grid-template-areas:
      'Deposit-Ttile-Origin Loan-Title-Origin'
      'Deposit-Item-01 Loan-Item-01'
      'Empty-area APR-Rate-Info-Loan-01'
      'Deposit-Item-02 Loan-item-02'
      'Empty-Area APR-Rate-Info-Loan-02';
    -ms-grid-rows: auto 0px auto 0px minmax(15px, 1fr) 0px auto 0px minmax(15px, 1fr);
    grid-template-rows: auto auto minmax(15px, 1fr) auto minmax(15px, 1fr);
  }

  .inputtextfield {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    overflow: hidden;
    width: 60%;
    margin-top: 0px;
    padding-left: 0px;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
    border: 2px solid #460456;
    border-radius: 10px;
    -webkit-transition: all 200ms ease;
    transition: all 200ms ease;
  }

  .inputtextfield:hover {
    border-style: solid;
    border-width: 1px;
    border-color: #6d6d6d;
    background-color: transparent;
  }

  .inputtextfield:active {
    border-style: solid;
    border-width: 1px;
    border-color: #6d6d6d;
  }

  .inputtextfield:focus {
    border-color: #6d6d6d;
  }

  .ratesinfo {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: end;
    -webkit-justify-content: flex-end;
    -ms-flex-pack: end;
    justify-content: flex-end;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .inputcheckfield {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    overflow: hidden;
    width: 25px;
    margin-top: 0px;
    margin-left: 20px;
    padding-left: 0px;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: start;
    -webkit-justify-content: flex-start;
    -ms-flex-pack: start;
    justify-content: flex-start;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
    border-style: none;
    border-width: 1px 1px 2px;
    border-color: #e3e3e3 #e3e3e3 #333;
    border-radius: 0px;
    -webkit-transition: all 200ms ease;
    transition: all 200ms ease;
  }

  .inputcheckfield:hover {
    border-style: none;
    border-width: 1px 1px 2px;
    border-color: #6d6d6d;
    background-color: transparent;
  }

  .inputcheckfield:active {
    border-style: none;
    border-width: 1px;
    border-color: #6d6d6d;
    -webkit-transform: scale(0.9);
    -ms-transform: scale(0.9);
    transform: scale(0.9);
  }

  .inputcheckfield:focus {
    border-color: #6d6d6d;
  }

  .image {
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    -ms-grid-row-align: center;
    align-self: center;
    -webkit-box-flex: 0;
    -webkit-flex: 0 auto;
    -ms-flex: 0 auto;
    flex: 0 auto;
  }

  .infroicon {
    height: 30px;
  }

  .secondarybutton {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    height: 55px;
    max-width: 250px;
    min-width: 100px;
    margin-right: 10px;
    padding-right: 20px;
    padding-left: 20px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: flex-end;
    -ms-flex-item-align: end;
    align-self: flex-end;
    border: 2px solid #f2def5;
    border-radius: 30px;
    background-color: #fff;
  }

  .secondarybutton:hover {
    background-color: #f2def5;
  }

  .chipflashpos {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    height: 55px;
    max-width: 250px;
    min-width: 100px;
    margin-right: 10px;
    margin-bottom: 20px;
    padding-right: 20px;
    padding-left: 20px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
    border: 2px solid #f2def5;
    border-radius: 30px;
    background-color: #a04bce;
  }

  .paragraph {
    margin-bottom: 20px;
  }

  .mainbutton {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    height: 55px;
    max-width: 250px;
    min-width: 100px;
    margin-right: 10px;
    padding-right: 20px;
    padding-left: 20px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
    border: 2px solid #ce80d9;
    border-radius: 30px;
    background-color: #7f2fff;
    color: #fff;
  }

  .mainbutton:hover {
    background-color: #3f0454;
  }

  .buttonwrapper {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    padding-top: 40px;
    padding-bottom: 40px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
  }

  .healthfactorinfo {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    height: 30px;
    margin-top: 10px;
    margin-bottom: 10px;
    padding: 0px 10px;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    background-color: transparent;
  }

  .healthfactorinfo.orange {
    display: none;
    background-color: #d17038;
  }

  .hfcontents {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-align-self: center;
    -ms-flex-item-align: center;
    align-self: center;
  }

  @media screen and (min-width: 1920px) {
    h1 {
      font-size: 30px;
      line-height: 40px;
    }

    h2 {
      font-size: 24px;
    }

    p {
      margin-top: 10px;
      margin-bottom: 20px;
      font-size: 22px;
      line-height: 28px;
    }

    .flashsuitelogo {
      max-width: 100%;
      min-width: 100%;
      margin-bottom: -31px;
    }

    .headercontents.right {
      padding-top: 100px;
    }

    .headerparagraph {
      font-size: 22px;
      line-height: 28px;
    }

    .headerparagraph.headeritemparagraph {
      width: auto;
      padding-right: 0px;
      padding-left: 0px;
      -webkit-align-self: center;
      -ms-flex-item-align: center;
      -ms-grid-row-align: center;
      align-self: center;
    }

    .textdarkmode {
      font-size: 22px;
      line-height: 32px;
    }

    .textdarkmode.token {
      padding-left: 68px;
    }

    .textdarkmode.button {
      font-size: 20px;
      line-height: 24px;
    }

    .headerbutton {
      max-width: 300px;
      min-width: 100px;
      margin-right: 0px;
    }

    .frostedglasswrapper {
      height: 55px;
      -webkit-box-pack: center;
      -webkit-justify-content: center;
      -ms-flex-pack: center;
      justify-content: center;
    }

    .headeritemcontents {
      padding: 40px 60px;
    }

    .flashlogo {
      min-width: 120%;
    }

    .blockimage {
      -webkit-align-self: auto;
      -ms-flex-item-align: auto;
      -ms-grid-row-align: auto;
      align-self: auto;
      -webkit-box-flex: 0;
      -webkit-flex: 0 auto;
      -ms-flex: 0 auto;
      flex: 0 auto;
    }

    .header1400container {
      max-width: 1400px;
    }

    .addressblock.textdarkmode {
      padding-left: 20px;
    }

    .buttondisk {
      top: 0px;
      right: 225.5417px;
      width: 55px;
      height: 55px;
    }

    .buttondisk.dropdown {
      top: 0px;
      right: 115.5417px;
    }

    .dropdown-toggle {
      height: 55px;
    }

    .sectioncontainer {
      height: auto;
    }

    .sectionbumper {
      height: 10vh;
    }

    .sectionbumper.bottom {
      bottom: -581px;
    }

    .sectionlogoimage {
      max-width: 120%;
      min-width: 250px;
    }

    .sectioncontents {
      height: 100%;
      padding-top: 200px;
    }

    .textlightmode {
      font-size: 20px;
      line-height: 32px;
    }

    .textlightmode.token {
      padding-left: 68px;
    }

    .textlightmode.numbers {
      font-size: 20px;
    }

    .textlightmode.rates {
      font-size: 14px;
    }

    .textlightmode.button {
      font-size: 20px;
    }

    .textlightmode.buttodarkmode {
      font-size: 20px;
    }

    .blockcontents {
      -webkit-align-self: auto;
      -ms-flex-item-align: auto;
      -ms-grid-row-align: auto;
      align-self: auto;
      -webkit-box-flex: 0;
      -webkit-flex: 0 auto;
      -ms-flex: 0 auto;
      flex: 0 auto;
    }

    .platformaddresslogo {
      top: 0px;
      right: 225.5417px;
      width: 55px;
      height: 55px;
    }

    .platformaddresslogo.dropdown {
      top: 0px;
      right: 115.5417px;
    }

    .right {
      font-size: 20px;
    }

    .left {
      font-size: 20px;
    }

    .griddestination {
      grid-template-areas:
        'Deposit-Ttile-Origin Loan-Title-Origin'
        'Deposit-Item-01 Loan-Item-01'
        'Empty-area APR-Rate-Info-Loan-01'
        'Area-2 Area';
      -ms-grid-rows: auto auto minmax(15px, 1fr) minmax(20px, 1fr);
      grid-template-rows: auto auto minmax(15px, 1fr) minmax(20px, 1fr);
    }

    .inputtextfield {
      border: 2px solid #460456;
      border-radius: 10px;
    }

    .ratesinfo {
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-orient: horizontal;
      -webkit-box-direction: normal;
      -webkit-flex-direction: row;
      -ms-flex-direction: row;
      flex-direction: row;
      -webkit-box-pack: end;
      -webkit-justify-content: flex-end;
      -ms-flex-pack: end;
      justify-content: flex-end;
      -webkit-box-align: center;
      -webkit-align-items: center;
      -ms-flex-align: center;
      align-items: center;
    }

    .secondarybutton {
      height: 60px;
      border: 2px solid #f2def5;
      border-radius: 30px;
      background-color: #fff;
    }

    .chipflashpos {
      height: 40px;
      margin-bottom: 20px;
      padding-top: 10px;
      padding-bottom: 10px;
      -webkit-box-flex: 0;
      -webkit-flex: 0 auto;
      -ms-flex: 0 auto;
      flex: 0 auto;
      border: 2px solid #f2def5;
      border-radius: 30px;
      background-color: #a04bce;
    }

    .paragraph {
      font-size: 20px;
    }

    .mainbutton {
      height: 60px;
      border: 2px solid #f2def5;
      border-radius: 30px;
      background-color: #7f2fff;
    }

    .healthfactorinfo {
      -webkit-box-align: end;
      -webkit-align-items: flex-end;
      -ms-flex-align: end;
      align-items: flex-end;
    }
  }

  @media screen and (max-width: 991px) {
    p {
      text-align: center;
    }

    .headercontents.right {
      width: auto;
      padding-top: 40px;
    }

    .header1400container {
      padding-right: 40px;
      padding-left: 40px;
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;
    }

    .navblockitemstrigger {
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      width: 90px;
    }

    .navblockitemstrigger:active {
      background-color: rgba(0, 0, 0, 0.5);
    }

    .navlink {
      width: auto;
    }

    .sectioncontents {
      height: 100%;
      margin-top: 0px;
      padding-top: 419px;
      padding-right: 20px;
      padding-left: 20px;
    }

    .columnspositions {
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;
      -webkit-box-align: center;
      -webkit-align-items: center;
      -ms-flex-align: center;
      align-items: center;
    }
  }

  @media screen and (max-width: 767px) {
    .headerbutton {
      max-width: 125px;
      min-width: 125px;
    }

    .flashlogo {
      max-width: 80%;
    }

    .navbaritems {
      overflow: hidden;
      width: 320px;
    }

    .navblockitemstrigger {
      display: -webkit-box;
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
      -webkit-align-self: center;
      -ms-flex-item-align: center;
      align-self: center;
    }

    .navbartextblock {
      display: block;
      overflow: hidden;
      height: auto;
      margin-top: -1px;
      -webkit-box-pack: center;
      -webkit-justify-content: center;
      -ms-flex-pack: center;
      justify-content: center;
      -webkit-box-align: center;
      -webkit-align-items: center;
      -ms-flex-align: center;
      align-items: center;
      -webkit-align-self: auto;
      -ms-flex-item-align: auto;
      -ms-grid-row-align: auto;
      align-self: auto;
    }

    .navlink {
      width: auto;
      margin-top: -3px;
    }

    .navlink.w--current {
      margin-top: 1px;
    }

    .sectionflashpos {
      padding-right: 20px;
      padding-left: 20px;
    }

    .columnspositions {
      -webkit-box-orient: vertical;
      -webkit-box-direction: normal;
      -webkit-flex-direction: column;
      -ms-flex-direction: column;
      flex-direction: column;
    }
  }

  @media screen and (max-width: 479px) {
    .flashsuitelogo {
      margin-bottom: 0px;
    }

    .nnavbarcontents {
      margin-right: 20px;
      margin-left: 20px;
    }

    .navbaritems {
      width: auto;
      -webkit-box-orient: horizontal;
      -webkit-box-direction: reverse;
      -webkit-flex-direction: row-reverse;
      -ms-flex-direction: row-reverse;
      flex-direction: row-reverse;
      -webkit-box-pack: start;
      -webkit-justify-content: flex-start;
      -ms-flex-pack: start;
      justify-content: flex-start;
      -webkit-flex-wrap: nowrap;
      -ms-flex-wrap: nowrap;
      flex-wrap: nowrap;
      -webkit-box-align: start;
      -webkit-align-items: flex-start;
      -ms-flex-align: start;
      align-items: flex-start;
      -webkit-align-content: space-between;
      -ms-flex-line-pack: justify;
      align-content: space-between;
    }

    .navblockitemstrigger {
      display: none;
    }

    .navbartextblock {
      display: none;
    }

    .navlink.w--current {
      border-bottom: 2px solid #0ff;
    }
  }

  @media screen and (min-width: 1920px) {
    #APRLoan01ORG.w-node-9c5920cd5a3d-3e5b97ee {
      -webkit-align-self: center;
      -ms-flex-item-align: center;
      -ms-grid-row-align: center;
      align-self: center;
    }

    #APRLoan01ORG.w-node-6a861f31309d-3e5b97ee {
      -webkit-align-self: center;
      -ms-flex-item-align: center;
      -ms-grid-row-align: center;
      align-self: center;
    }

    #w-node-e2fd51c45bfd-3e5b97ee {
      -ms-grid-row: 5;
      -ms-grid-column: 1;
      grid-area: Empty-area;
    }

    .griddestination > #w-node-e2fd51c45bfd-3e5b97ee {
      -ms-grid-row: 5;
      -ms-grid-column: 1;
    }

    @media screen and (min-width: 1920px) {
      .griddestination > #w-node-e2fd51c45bfd-3e5b97ee {
        -ms-grid-row: 3;
        -ms-grid-column: 1;
      }
    }

    #APRLoan01ORG.w-node-4600669af223-3e5b97ee {
      -webkit-align-self: center;
      -ms-flex-item-align: center;
      -ms-grid-row-align: center;
      align-self: center;
    }

    #APRLoan01ORG.w-node-56b66b626e79-3e5b97ee {
      -webkit-align-self: center;
      -ms-flex-item-align: center;
      -ms-grid-row-align: center;
      align-self: center;
    }

    #APRLoan01ORG.w-node-81b5b1f95777-3e5b97ee {
      -webkit-align-self: center;
      -ms-flex-item-align: center;
      -ms-grid-row-align: center;
      align-self: center;
    }
  }
</style>
