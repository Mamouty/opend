//Since actor classes have to be defined in their own source files we define this NFT actor class here on its own.
//Each NFT is an instantiated canister on the IC blockchain. 
import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

//Creating an actor class with the inputs; name, owner and content which is the image. This later is gonna be passed using an array of 8 bit natural numbers.
actor class NFT (name: Text, owner: Principal, content: [Nat8]) = this {// "this" represents this current entire class

    // Using the class's values to pass the data to the nft's items
    let itemName = name;
    let nftOwner = owner;
    let imageBytes = content;

    // Returning the values through query functions
    public query func getName() : async Text {
        return itemName;
    };

    public query func getOwner() : async Principal {
        return nftOwner;
    };

    public query func getAsset() : async [Nat8] {
        return imageBytes;
    };
    // Getting hold of this canister's Id and returning it through a function
    public query func getCanisterId() : async Principal {
        // Using fromActor() method to retrieve the Actor's Principal
        return Principal.fromActor(this);
    };

};