<script>
  let time = "";
  setInterval(() => {
    time = new Intl.DateTimeFormat("fr", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date());
  }, 1000);
</script>

<svelte:options tag="svelte-horloge" immutable={true} />
<p>H1 {time}</p>
