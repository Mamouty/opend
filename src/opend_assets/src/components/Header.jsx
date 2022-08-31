import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import homeImage from "../../assets/home-img.png";
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";

function Header() {

  const [userOwnedGallery, setOwnedGallery] = useState();
  const [listingGallery, setListingGallery] = useState();

  // Retrieving the user's NFTs
  async function getNFTs() {
    const userNFTIds = await opend.getOwnedNFTs(CURRENT_USER_ID);
    console.log(userNFTIds);
    // Setting the Gallery component for a specific user by passing the Ids of his NFTs
    setOwnedGallery(<Gallery title="My NFTs" ids={userNFTIds} role="collection"/>);
    // Getting the array of listed NFTs for sale
    const listedNFTIds = await opend.getListedNFTs();
    console.log(listedNFTIds);
    // Passing the listed NFTs for sale to the Gallery component
    setListingGallery(<Gallery title="Discover" ids={listedNFTIds} role="discover" />)

  };

  useEffect(() => {
    getNFTs();
    }, []);

  return (
    // Setting BrowserRouter forceRefresh to true to refresh the page when navigating using the links
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <h5 className="Typography-root header-logo-text">OpenD</h5>
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            {/* Setting different routes for the buttons using the Link component */}
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">My NFTs</Link>
            </button>
          </div>
        </header>
      </div>
      {/* Using the Switch to render the components inside the Route components */}
      <Switch>
      {/* Specifying the paths of the components to render in the Route components attributes */}
      {/* The 'exact' keyword will make sure the Switch component will render the path with the exact route otherwise it will ignore whatever is after the forward slash and render the root route '/' */}
        <Route exact path="/">
              <img className="bottom-space" src={homeImage} />
        </Route>
        {/* The routes specified in the 'path' attributes should match the ones of the Link components 'to' attributes */}
        <Route path="/discover">
          {listingGallery}
        </Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">
        {/* Rendering the Gallery with the NFTs of specific user */}
          {userOwnedGallery}
        </Route>
      </Switch>
    </BrowserRouter> 
  );
}

export default Header;
