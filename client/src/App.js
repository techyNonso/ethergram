import Ethergram from "./contracts/Ethergram.json";
import React, { Component } from "react";
import Identicon from "identicon.js";
import Navbar from "./components/Navbar";
import Main from "./components/Main";
import Web3 from "web3";
import "./App.css";

//Declare IPFS
import { create } from "ipfs-http-client";

/* Create an instance of the client */
const client = create("https://ipfs.infura.io:5001/api/v0");

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkData = Ethergram.networks[networkId];
    if (networkData) {
      const ethergram = new web3.eth.Contract(
        Ethergram.abi,
        networkData.address
      );
      this.setState({ ethergram });
      const imagesCount = await ethergram.methods.imageCount().call();
      this.setState({ imagesCount });
      // Load images
      for (var i = 1; i <= imagesCount; i++) {
        const image = await ethergram.methods.images(i).call();
        this.setState({
          images: [...this.state.images, image],
        });
      }
      // Sort images. Show highest tipped images first
      this.setState({
        images: this.state.images.sort((a, b) => b.tipAmount - a.tipAmount),
      });
      this.setState({ loading: false });
    } else {
      window.alert("Ethergram contract not deployed to detected network.");
    }
  }

  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  uploadImage = async (description) => {
    console.log("Submitting file to ipfs...");
    // upload the file
    const added = await client.add(this.state.buffer);

    this.setState({ loading: true });
    this.state.ethergram.methods
      .uploadImage(added.path, description)
      .send({ from: this.state.account })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  };

  giftImageOwner(id, tipAmount) {
    this.setState({ loading: true });
    this.state.ethergram.methods
      .giftImageOwner(id)
      .send({ from: this.state.account, value: tipAmount })
      .on("transactionHash", (hash) => {
        this.setState({ loading: false });
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "",
      ethergram: null,
      images: [],
      loading: true,
    };

    this.uploadImage = this.uploadImage.bind(this);
    this.giftImageOwner = this.giftImageOwner.bind(this);
    this.captureFile = this.captureFile.bind(this);
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <Main
            images={this.state.images}
            captureFile={this.captureFile}
            uploadImage={this.uploadImage}
            tipImageOwner={this.tipImageOwner}
            giftImageOwner={this.giftImageOwner}
          />
        )}
      </div>
    );
  }
}

export default App;
