module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-purple": "#330aee",
        "dark-blue": "#2251f8",
        "dark-button": "#2251f8",
        "light-purple": "#eae5ff",
        "light-font": "#67728d",
        "bold-font": "#171b1e",
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        ".btn-new": {
          "@apply bg-[#ff7e61] text-white text-sm font-normal py-2 px-4 rounded":
            {},
        },
        ".btn-create": {
          "@apply bg-green-600 text-white text-sm font-normal py-2 px-4 rounded":
            {},
        },
        ".btn-secondary": {
          "@apply bg-gray-500 text-white text-sm font-normal py-2 px-4 rounded":
            {},
        },
        ".boxPropie": {
          "@apply bg-white rounded shadow p-6": {},
        },
        ".inputPropie": {
          "@apply bg-[#f8f8f8] border border-[#c7c6c6] text-[#000] flex font-normal h-[46px]  rounded overflow-hidden":
            {},
        },
      });
    },
  ],
};
