
module.exports = () => {
    const rewrites = () => {
      return [
        {
          source: "/file/:path*",
          destination: "http://172.32.0.1:10020/:path*",
        },
        {
            source: "/DB/:path*",
            destination: "http://172.30.0.1:8090/:path*",
        },
      ];
    };
    return {
      rewrites,
    };
  };