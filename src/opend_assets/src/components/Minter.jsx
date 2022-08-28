import React, { useState } from "react";
//importing the useForm hook and use it to pull data that would be uploaded or entered in the form. 
import { useForm } from "react-hook-form";
import { opend } from "../../../declarations/opend";
import { Principal } from "@dfinity/principal"; // To use its methods like toText
import Item from "./Item";

function Minter() {

  //The react-hook-form takes two inputs inside curly braces. 
  //The first input of the component is the object register which is used to add and register all the inputs of the user from the form.
  //The second input is handleSubmit which should be called when the submit button is triggered
  const {register, handleSubmit} = useForm();
  const [nftPrincipal, setNFTPrincipal] = useState("");
  const [loaderHidden, setLoaderHidden] = useState(true);
  // Creating a method to handle the submitting it will receive the data from our form
  async function onSubmit(data) {
    // Displaying the loader of the nft after triggering the submit button
    setLoaderHidden(false);
    const name = data.name;
    const image = data.image[0];
    // Storing the binary data of the uploaded image in an array using the arrayBuffer() method 
    const imageArray = await image.arrayBuffer();
    // Converting the imageArray into Uint8Array to match the Nat8 array data type of the nft canister
    const imageByteData = [...new Uint8Array(imageArray)];
    // Creating the new nft using the mint function from the opend main canister
    const newNFTID = await opend.mint(imageByteData, name);
    console.log(newNFTID.toText());
    setNFTPrincipal(newNFTID);
    // Hiding the loader once the nft has been created
    setLoaderHidden(true);

  };
  // If there is no minted nft yet we render the Minter form
  if (nftPrincipal == "") {
    return (
      <div className="minter-container">
        <div hidden={loaderHidden} className="lds-ellipsis">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
      </div>
        <h3 className="makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
          Create NFT
        </h3>
        <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
          Upload Image
        </h6>
        <form className="makeStyles-form-109" noValidate="" autoComplete="off">
          <div className="upload-container">
            <input
            // Registering the user's uploaded file as an object
            {...register("image", {required: true})}
              className="upload"
              type="file"
              accept="image/x-png,image/jpeg,image/gif,image/svg+xml,image/webp"
            />
          </div>
          <h6 className="form-Typography-root makeStyles-subhead-102 form-Typography-subtitle1 form-Typography-gutterBottom">
            Collection Name
          </h6>
          <div className="form-FormControl-root form-TextField-root form-FormControl-marginNormal form-FormControl-fullWidth">
            <div className="form-InputBase-root form-OutlinedInput-root form-InputBase-fullWidth form-InputBase-formControl">
              <input
              // Registering the user's typed data as an object
              {...register("name", {required: true})}
                placeholder="e.g. CryptoDunks"
                type="text"
                className="form-InputBase-input form-OutlinedInput-input"
              />
              <fieldset className="PrivateNotchedOutline-root-60 form-OutlinedInput-notchedOutline"></fieldset>
            </div>
          </div>
          <div className="form-ButtonBase-root form-Chip-root makeStyles-chipBlue-108 form-Chip-clickable">
          {/* Calling the onSubmit method and passing it all the components registered in the form data using the handleSubmit hook*/}
            <span onClick={handleSubmit(onSubmit)} className="form-Chip-label">Mint NFT</span>
          </div>
        </form>
      </div>
    );
    // Otherwise if there has been any created nft then we render them through the Item component
  } else {
    return (
     <div className="minter-container">
       <h3 className="Typography-root makeStyles-title-99 Typography-h3 form-Typography-gutterBottom">
         Minted!
       </h3>
       <div className="horizontal-center">
       {/* Passing the nft's id as prop to the Item component */}
         <Item id={nftPrincipal.toText()}/>
       </div>
     </div>
    );
  }
};

export default Minter;
