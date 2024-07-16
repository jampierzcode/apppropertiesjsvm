import React from "react";
import NavigationPage from "./NavigationPage";
import FooterPage from "./FooterPage";
import { SharedDataProvider } from "./SharedDataContext";

const LayoutPages = ({ children }) => {
  return (
    <SharedDataProvider>
      <div className="bg-white">
        <NavigationPage />
        {children}
        <FooterPage />
      </div>
    </SharedDataProvider>
  );
};

export default LayoutPages;
