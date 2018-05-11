exports.create = {
  User: [
    {
      name: {
        first: '<%=authorName%>',
        last: '<%=authorName%>',
      },
      email: '<%=authorEmail%>',
      password: 'password',
      isAdmin: true,
      phone: '+7 (999) 000 00-00',
    },
  ],
};
