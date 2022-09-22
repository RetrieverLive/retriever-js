import { pinJSONToIPFS } from './pinata.js'
import { createAlchemyWeb3 } from "@alch/alchemy-web3"
// import contractABI from './nft-abi.json'
import contractABI from './test-abi.json'

const alchemyKey = ""
const web3 = createAlchemyWeb3(alchemyKey)
const contractAddress = '0xc1D81f8be4AF8B446390384428EbC75B59246CDC'

// mintNFT mints metadata of the uploaded video
async function mintNFT (cid, title, thumbnail) {
    // error handling
    if ((title.trim() === "")) {
        return {
            success: false,
            status: "❗️ Please make sure all fields are completed before minting.",
        }
    }

    // make metadata of NFT
    const metadata = new Object()
    metadata.name = title  // name indicates video title
    metadata.image = thumbnail  // image incicates TxHash of the video
    metadata.description = cid  // CID of the uploaded video
    // make pinata call
    const pinataResponse = await pinJSONToIPFS(metadata)
    if (!pinataResponse.success) {
        return {
            success: false,
            status: "😥 Something went wrong while uploading your tokenURI.",
        }
    }
    const tokenURI = pinataResponse.pinataUrl
    console.log(tokenURI)
    window.contract = await new web3.eth.Contract(contractABI, contractAddress)

    // set up your Ethereum transaction
    // const price = web3.utils.toWei('1', 'ether')
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        data: window.contract.methods.mintNFT(tokenURI).encodeABI() // make call to NFT smart contract
        // data: window.contract.methods.mintNFT(tokenURI, price).encodeABI() // make call to NFT smart contract
    }

    try {
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            })
        return {
            success: true,
            status: txHash
        }
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }
    }
}

export { mintNFT }