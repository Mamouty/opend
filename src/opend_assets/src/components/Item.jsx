import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
//Importing the HttpAgent to create agents
import { Actor, HttpAgent } from "@dfinity/agent";
//Importing the IDL(Interface Description Language) factory 
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";

function Item(props) {

  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();

  //Getting hold of the nft canister id to use its methods
  const id = props.id;
  //Making http requests in order to access the nft canister 
  const localHost = "http://localhost:8080/";
  //Creating a new HttpAgent to make requests using the localhost
  const agent = new HttpAgent({host: localHost});

  //Creating an async function to call the async methods of the nft canister
  async function loadNFT() {
  //Using the HttpAgent in order to fetch the name, owner and image from the nft canister.
  //Passing the idlFactory as the first input.
  //The second input will be the options.
    const NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

    const name = await NFTActor.getName();
    setName(name);
    const owner = await NFTActor.getOwner();
    setOwner(owner.toLocaleString());
    const imageData = await NFTActor.getAsset();
    //Converting the imageData from Nat8 to Uint8Array to be read by JavaScript
    const imageContent = new Uint8Array(imageData);
    //Creating an image URL from the Unit8Array imageContent by passing it as a blob object
    //.buffer will turn imageContent to an array buffer
    const image = URL.createObjectURL(new Blob([imageContent.buffer], { type: "image/png" }));
    setImage(image);

  };

//Calling the loadNFT() only once when this component gets rendered using the useEffect() hook by leaving its array parameter empty.
  useEffect(() => { 
    loadNFT(); 
  }, []);

  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />
        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Item;
