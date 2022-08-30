//The main.mo file will be used to build the backend for the nft market place.
import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import NFTActorClass "../NFT/nft";// To use the nft actor class
import HashMap "mo:base/HashMap";
import List "mo:base/List";


actor OpenD {

    // Creating a new data type to hold in it the owner's id and price of the sold NFT
    // The created new data type has to have the first letter capitalized and list all of its properties inside curly braces
    private type Listing = {
        itemOwner: Principal;
        itemPrice: Nat;
    };


    // Setting up a data stores  with the HashMap to keep track of the minted NFTs and their owners
    // The HashMap for the NFTs. Each Principal id of an NFT relate to a unique NFT
    var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(1, Principal.equal, Principal.hash);
    // The HashMap for the Owners of NFTs. One Principal most likely relates to a List of NFTs. 
    var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(1, Principal.equal, Principal.hash);
    // Setting a HashMap to store the data of the NFTs listed to sell with their corresponding owners
    var mapOfListings = HashMap.HashMap<Principal, Listing>(1, Principal.equal, Principal.hash);

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
        // Adding the newly created NFTs to the HashMap
        mapOfNFTs.put(newNFTPrincipal, newNFT);
        addToOwnershipMap(owner, newNFTPrincipal);

        return newNFTPrincipal
    };
    // Adding the newly created NFT to the mapOfOwners using a private function.
    private func addToOwnershipMap(owner: Principal, nftId: Principal) {
        // Using a switch statement to avoid assigning the new NFT to an owner who's Principal has not been stored yet in the HashMap
        var ownedNFTs : List.List<Principal> = switch (mapOfOwners.get(owner)) {
            // In the case mapOfOwners.get(owner) is null we return an empty List
            case null List.nil<Principal>();
            // In the case we get a result we assign them to the var ownedNFTs
            case (?result) result;
        };
        // Pushing the newly minted NFT to the List and updating it to its new version
        ownedNFTs := List.push(nftId, ownedNFTs);
        // Storing the owner's Principal Id and his corresponding List of NFTs Principal Ids
        mapOfOwners.put(owner, ownedNFTs);
    };

    // Fetching a user's the List of Principal Ids and turn it into an array to be used in the frontend
    public query func getOwnedNFTs(user: Principal) : async [Principal] {
        var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user)) {
            case null List.nil<Principal>();
            case (?result) result;
        };
        return List.toArray(userNFTs);
    };
    // Using a shared function to add the listing price the mapOfListings HashMap
    public shared(msg) func listItem(id: Principal, price: Nat) : async Text {
        // Checking if the NFT already exists in the HashMap
        var item : NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
            case null return "NFT does not exist.";
            case (?result) result;
        };
        // Getting hold of the owner of the NFT to be sold
        let owner = await item.getOwner();
        // Checking if this owner is the same as the person calling the listItem() method in order to create the new listing and push it to  mapOfListings
        if (Principal.equal(owner, msg.caller)) {
            let newListing : Listing = {
                itemOwner = owner;
                itemPrice = price;
            };
            mapOfListings.put(id, newListing);
            return "Success";
        } else {
            return "You don't own the NFT."
        }
    };
    // Getting hold of the Principal id this canister through a function
    public query func getOpenDCanisterID() : async Principal {
        return Principal.fromActor(OpenD);
    };
    // Checking if NFT has been listed for sale
    public query func isListed(id: Principal) : async Bool {
        if (mapOfListings.get(id) == null) {
            return false;
        } else {
            return true;
        }
    };
 
};
