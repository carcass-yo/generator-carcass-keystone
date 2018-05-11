exports.create = {
  AppConfig: [
    {
      TITLE_POSTFIX: '<%=appname%>',
      TITLE_SEP: ' - ',
      YA_METRIKA_CONF: JSON.stringify({
        id: 47243553,
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      }),
    },
  ],
};
