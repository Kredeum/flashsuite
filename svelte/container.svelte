<script>
  import Connect from "./connect.svelte";
</script>

<div class="nnavbar">
  <div class="nnavbarcontents">
    <Connect  />
  </div>
</div>
<div class="headermain fs-headermain">
  <slot />
</div>

<style>
  .nnavbar {
    position: absolute;
    left: 0%;
    top: 6%;
    right: 0%;
    bottom: auto;
    z-index: 2;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    height: 55px;
    padding-bottom: 0px;
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
    background-color: transparent;
    box-shadow: none;
  }

  .nnavbarcontents {
    position: fixed;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    width: 100%;
    max-width: 1400px;
    margin-right: 0px;
    margin-left: 0px;
    padding-right: 140px;
    padding-left: 140px;
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
    -webkit-align-self: stretch;
    -ms-flex-item-align: stretch;
    align-self: stretch;
    -webkit-box-flex: 0;
    -webkit-flex: 0 0 auto;
    -ms-flex: 0 0 auto;
    flex: 0 0 auto;
  }

  .headermain {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    height: 100%;
    min-height: 100vh;
    margin-bottom: 0px;
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
    background-image: url("../images/Synth-BG-Header-Hi.png");
    background-position: 50% 50%;
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
  }

  .fs-headermain {
    padding-top: 10%;
    padding-bottom: 10%;
  }

  @media screen and (max-width: 479px) {
    .nnavbarcontents {
      margin-right: 20px;
      margin-left: 20px;
    }
  }

  @media screen and (max-width: 991px) {
    .nnavbarcontents {
      margin-right: 40px;
      margin-left: 40px;
    }
  }

  @media screen and (min-width: 1920px) {
    .nnavbarcontents {
      padding-right: 0px;
      padding-left: 0px;
      -webkit-box-pack: end;
      -webkit-justify-content: flex-end;
      -ms-flex-pack: end;
      justify-content: flex-end;
    }
  }
</style>
