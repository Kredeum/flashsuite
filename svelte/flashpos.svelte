<script>
  import Container from './container.svelte';
  import Dashboard from './dashboard.svelte';

  let address;
  let originAddress = "";

  if (address) {
    console.log('address', address);
    originAddress = address;
  }
</script>


<Container bind:address>
  <div style="height: 1000px; width: 80%;">
    <!-- BUMPER -->
    <div class="sectionbumper fs-sectionbumper">
      <div class="blockimage">
        <img
          src="images/FLSuite-Logo-Full-Dark.svg"
          loading="lazy"
          width="125"
          alt=""
          class="flashlogo"
        />
      </div>
    </div>
    <!-- CONTENTS -->
    <div class="sectioncontents fs-sectioncontents">
      <img
      src="images/FlashPos-SubLogo-Light.svg"
      loading="lazy"
      width="200"
      alt=""
      class="sectionlogoimage"
      />
      <h1>Migrate your positions</h1>
      <p class="paragraph">
        Use 2 accounts to connect and disconnect to FlashSuite when you are
        prompted.
      </p>
     
      <div class="columnspositions fs-columnspositions w-row">
        <div id="chipFlashPos" class="sectionchip fs-chip">
          <div id="amountDep02ORG" class="textdarkmode button">
            Position Migration
          </div>
        </div>
        <!-- ORIGIN -->
        <div
        id="OriginPosition"
        class="fs-col-origin columnposition w-col w-col-6 w-col-stack w-col-small-small-stack"
      >
        <div class="columntitlebar">
          <h2 id="columnTitle">Origin</h2>
          <div
            data-hover=""
            data-delay="0"
            class="adressdropdown w-dropdown"
          >
            <div class="dropdown-toggle addresses w-dropdown-toggle">
              <div class="arrow lightmode w-icon-dropdown-toggle"></div>
              <div id="platformAddressLogo" class="buttondisk">
                <img
                  src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                  loading="lazy"
                  id="platformLogo"
                  alt=""
                  class="placeholderimage"
                />
              </div>
              <div id="chosenAddressORG" class="textlightmode">
                Select address
              </div>
            </div>
            <nav class="dropdown-list w-dropdown-list">
              <a
                href="#"
                id="accItem-01"
                class="dropdownitem w-dropdown-link"
                >Acc.1 address</a
              >
              <a
                href="#"
                id="accItem-02"
                class="dropdownitem w-dropdown-link"
                >Acc.2 address</a
              >
            </nav>
          </div>
          <img
            src="images/Network-Dot-Green.svg"
            loading="lazy"
            width="50"
            alt=""
            class="connectindicator"
          />
        </div>
        <div id="userMessagePurple" class="usermessagesbar start">
          <div
            id="userMessagePurpleText"
            class="textdarkmode usermessage"
          >
            Please connect your Origin account
          </div>
        </div>
        <div id="userMessageOrange" class="usermessagesbar orange start">
          <div
            id="userMessageOrangeText"
            class="textdarkmode usermessage"
          >
            You need to be connected to the Kovan Test Net
          </div>
        </div>
        <!-- ORIGIN DASHBOARD -->
        <Dashboard isOrigin={true} user={originAddress} />
      </div>
      <!-- DESTINATION -->
      <div
        id="DepositPosition"
        class="fs-col-destination columnposition w-col w-col-6 w-col-stack w-col-small-small-stack"
            >
              <div class="columntitlebar reverse">
                <h2 id="columnTitle">Destination</h2>
                <div
                  data-hover=""
                  data-delay="0"
                  class="adressdropdown w-dropdown"
                >
                  <div class="dropdown-toggle addresses w-dropdown-toggle">
                    <div class="arrow lightmode w-icon-dropdown-toggle"></div>
                    <div id="platformAddressLogo" class="buttondisk">
                      <img
                        src="https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg"
                        loading="lazy"
                        id="platformLogo"
                        alt=""
                        class="placeholderimage"
                      />
                    </div>
                    <div id="chosenAddressDEST" class="textlightmode">
                      Select address
                    </div>
                  </div>
                  <nav class="dropdown-list w-dropdown-list">
                    <a
                      href="#"
                      id="accItem-01"
                      class="dropdownitem w-dropdown-link"
                      >Acc.1 address</a
                    >
                    <a
                      href="#"
                      id="accItem-02"
                      class="dropdownitem w-dropdown-link"
                      >Acc.2 address</a
                    >
                  </nav>
                </div>
                <img
                  src="images/Network-Dot-Green.svg"
                  loading="lazy"
                  width="50"
                  alt=""
                  class="connectindicator"
                />
              </div>
              <div id="userMessagePurple" class="usermessagesbar">
                <div
                  id="userMessagePurpleText"
                  class="textdarkmode usermessage"
                >
                  Please connect your Origin account
                </div>
              </div>
              <div id="userMessageOrange" class="usermessagesbar orange">
                <div
                  id="userMessageOrangeText"
                  class="textdarkmode usermessage"
                >
                  Please connect your Origin account
                </div>
              </div>
            </div>
      </div>  
    </div>
  </div>
</Container>

<style>
  .fs-sectioncontents {
    background-color: white;
    border-radius: 0 0 20px 20px;
  }

  .fs-sectionbumper {
    border-bottom: none;
    border-radius: 20px 20px 0 0;
  }

  .fs-columnspositions {
    position: relative;
    margin-top: 40px;
  }
  .fs-chip {
    position: absolute;
    top: -14px;
    z-index: 1;
  }
  .fs-col-origin {
    margin-right: 5px;
  }
  .fs-col-destination {
    margin-left: 5px;
  }
</style>