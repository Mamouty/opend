//The main.mo file will be used to build the backend for the nft market place.
import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import NFTActorClass "../NFT/nft";// To use the nft actor class


actor OpenD {
    // Creating a shared function to access the identity of the user who would call it to mint an NFT 
    public shared(msg) func mint(imgData: [Nat8], name: Text) : async Principal {
        let owner : Principal = msg.caller;

        // Creating a cycle for the newly created nft canister to run it on the live IC blockchain
        // The cost for creating a canister is 100 billion. To keep up and running add to it 500 million.
        Debug.print(debug_show(Cycles.balance()));
        Cycles.add(100_500_000_000);
        // Initializing asynchronously the nft actor class with the received data from the user
        let newNFT = await NFTActorClass.NFT(name, owner, imgData);
        Debug.print(debug_show(Cycles.balance()));
        // Getting the Principal of the newly created nft
        let newNFTPrincipal = await newNFT.getCanisterId();

        return newNFTPrincipal
    };
 
};
