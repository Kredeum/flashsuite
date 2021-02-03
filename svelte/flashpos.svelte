<script>
  import Container from './container.svelte';
</script>


<Container>
  <div style="height: 1000px; width: 80%;">
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
    <div id="chipFlashPos" class="sectionchip">
      <div id="amountDep02ORG" class="textdarkmode button">
        Position Migration
      </div>
    </div>
    </div>


  </div>
</Container>

<style>
  .fs-sectioncontents {
    background-color: white;
  }

  .fs-sectionbumper {
    border-bottom: none;
    border-radius: 20px 20px 0 0;
  }
</style>