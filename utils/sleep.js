const sleep = async (milliseconds) =>
  // eslint-disable-next-line no-promise-executor-return
  new Promise((resolve) => setTimeout(resolve, milliseconds));

  export default sleep;
