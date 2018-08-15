<template lang="pug">
 div
</template>

<script>
import './index.css';
export default {};
</script>

<style lang="stylus" scoped>
div {
  background: red;
}
</style>

<style>
@custom-media --viewport-medium (width <= 50rem);
@custom-selector :--heading h1, h2, h3, h4, h5, h6;

:root {
  --mainColor: #12345678;
}

body {
  color: var(--mainColor);
  font-family: system-ui;
  overflow-wrap: break-word;
}

:--heading {
  background-image: image-set(
    url(img/heading.png) 1x,
    url(img/heading@2x.png) 2x
  );

  @media (--viewport-medium) {
    margin-block: 0;
  }
}

a {
  color: rebeccapurple;

  &:hover {
    color: color-mod(var(--mainColor) alpha(80%));
  }
}
</style>

