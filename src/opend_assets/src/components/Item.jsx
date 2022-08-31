import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
//Importing the HttpAgent to create agents
import { Actor, HttpAgent } from "@dfinity/agent";
//Importing the IDL(Interface Description Language) factory 
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import { opend } from "../../../declarations/opend"; 
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState(""); 
  const [priceLabel, setPriceLabel] = useState();

  //Getting hold of the nft canister id to use its methods
  const id = props.id;
  //Making http requests in order to access the nft canister 
  const localHost = "http://localhost:8080/";
  //Creating a new HttpAgent to make requests using the localhost
  const agent = new HttpAgent({host: localHost});
  // TODO : when deploy live, remove the line down below
  agent.fetchRootKey();

  let NFTActor;

  //Creating an async function to call the async methods of the nft canister
  async function loadNFT() {
  //Using the HttpAgent in order to fetch the name, owner and image from the nft canister.
  //Passing the idlFactory as the first input.
  //The second input will be the options.
    NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    setName(name);
    const owner = await NFTActor.getOwner();
    setOwner(owner.toLocaleString());
    const imageData = await NFTActor.getAsset();
    // Converting the imageData from Nat8 to Uint8Array to be read by JavaScript
    const imageContent = new Uint8Array(imageData);
    // Creating an image URL from the Unit8Array imageContent by passing it as a blob object
    // .buffer will turn imageContent to an array buffer
    const image = URL.createObjectURL(new Blob([imageContent.buffer], { type: "image/png" }));
    setImage(image);

    if (props.role == "collection") {
      // Calling the isListed() function to know if NFT item has been listed for sale or not
      const nftIsListed = await opend.isListed(props.id);
      // Changing the styling and functionality of the NFT item if it's listed for sale
      if (nftIsListed) {
        setOwner("OpenD");
        setBlur({filter: "blur(4px)"});
        setSellStatus("Listed");
      } else {
      // Passing the function handleSell as a prop to the Button component when it is clicked
      setButton(<Button handleClick={handleSell} text={"Sell"} />);
      }
    } else if (props.role == "discover"){
      const originalOwner = await opend.getOriginalOwner(props.id);
      // Dispalying the button with buy text if the original oner of the NFT is not the current user
      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        // Rendering the NFTs listed for sale in the Gallery component 
        setButton(<Button handleClick={handleBuy} text={"Buy"} />);
      }
      // Displaying the price of the NFT listed to sale
      const price = await opend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />);

    }

  };
 
// Calling the loadNFT() only once when this component gets rendered using the useEffect() hook by leaving its array parameter empty.
  useEffect(() => { 
    loadNFT(); 
  }, []);
// Setting the price input when the button sell is clicked
  let price;
  function handleSell() {
    console.log("Sell clicked");
    setPriceInput(
      <input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );
    // Changing the button's text to "confirm" and it's functionality to sell the item 
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  async function sellItem() {
    // Adding a style of blur to the NFT image once it's sold
    setBlur({filter: "blur(4px)"});
    setLoaderHidden(false);
    console.log("set price = " + price);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listing " + listingResult);
    if (listingResult == "Success") {
      // Getting the Principal id of the new owner of the NFT
      const openDId = await opend.getOpenDCanisterID();
      // Transferring the NFT to the new owner
      const transferResult = await NFTActor.transferOwnership(openDId);
      console.log("transfer: " + transferResult);
      if (transferResult == "Success") {
        setLoaderHidden(true);
        // Removing the button and the price form the nft card
        setButton();
        setPriceInput();
        // Changing the name of the owner
        setOwner("OpenD");
        setSellStatus("Listed");
      }
    }
  };

  async function handleBuy() {
    console.log("Buy was triggered");
  };
 
  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
        {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"> {sellStatus}</span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
