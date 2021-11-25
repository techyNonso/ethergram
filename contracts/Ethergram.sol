// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

contract Ethergram {
    //contract name
    string public name = "Ethergram";

    uint256 public imageCount = 0;

    //image creation event
    event ImageCreated(
        uint256 id,
        string hash,
        string description,
        uint256 giftAmount,
        address payable author
    );
    //gifting event
    event ImageGifted(
        uint256 id,
        string hash,
        string description,
        uint256 giftAmount,
        address payable author
    );
    //image Sale event
    event ImageSale(
        uint256 id,
        string hash,
        string description,
        uint256 giftAmount,
        address payable from,
        address payable to
    );

    //Image storage
    struct Image {
        uint256 id;
        string hash;
        string description;
        uint256 giftAmount;
        address payable author;
    }
    mapping(uint256 => Image) public images;

    //create image
    function uploadImage(string memory _hash, string memory _description)
        public
    {
        //ensure description was passed
        require(bytes(_hash).length > 0, "Image hash is needed");

        //ensure image description was passed
        require(bytes(_description).length > 0, "Image description is needed");

        //ensure address was provided
        require(msg.sender != address(0x0), "Address is needed");

        //increase image count
        imageCount++;
        //save image
        images[imageCount] = Image(
            imageCount,
            _hash,
            _description,
            0,
            msg.sender
        );

        //emit event
        emit ImageCreated(imageCount, _hash, _description, 0, msg.sender);
    }

    //Gift image
    function giftImageOwner(uint256 _id) public payable {
        //ensure _id is valid
        require(_id > 0 && _id <= imageCount);
        //get image from storage
        Image memory _image = images[_id];
        //fetch author
        address payable _author = _image.author;
        //transfer value
        _author.transfer(msg.value);
        //add gift amount
        _image.giftAmount += msg.value;

        //store back in mapping
        images[_id] = _image;

        // emit event
        emit ImageGifted(
            _id,
            _image.hash,
            _image.description,
            _image.giftAmount,
            _author
        );
    }

    //Buy Image
    function buyImage(uint256 _id) public payable {
        Image memory _image = images[_id];
        address payable _author = _image.author;
        //pay
        _author.transfer(msg.value);
        //change gift amount to 0
        _image.giftAmount = 0;
        //change author
        _image.author = msg.sender;
        //store back to mapping
        images[_id] = _image;

        //emit image sale event
        emit ImageSale(
            _id,
            _image.hash,
            _image.description,
            _image.giftAmount,
            _author,
            msg.sender
        );
    }
}
