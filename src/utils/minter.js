import { pinJSONToIPFS } from './pinata.js'
import { createAlchemyWeb3 } from "@alch/alchemy-web3"
// import contractABI from './nft-abi.json'
import contractABI from './test-abi.json'

const alchemyKey = ""
const web3 = createAlchemyWeb3(alchemyKey)
const contractAddress = '0xc1D81f8be4AF8B446390384428EbC75B59246CDC'

async function loadMetadata(txHash) {
    const tx = await web3.eth.getTransactionReceipt(txHash)
    const tokenId = web3.utils.hexToNumber(tx.logs[0].topics[3])
    const metadata = await web3.alchemy.getNftMetadata({
        contractAddress: contractAddress,
        tokenId: tokenId,
    })
    
    window.contract = new web3.eth.Contract(contractABI, contractAddress)
    let nftActivity = await window.contract.getPastEvents("allEvents", { fromBlock:0, toBlock:'latest', })
    const owner = await window.contract.methods.ownerOf(tokenId).call()
    const price = await window.contract.methods.priceOf(tokenId).call()
    const data = {
        metadata: metadata.metadata,
        contractAddr: contractAddress,
        tokenId: tokenId,
        tokenStd: metadata.id.tokenMetadata.tokenType,
        owner: owner,
        price: web3.utils.fromWei(price),
        activities: nftActivity
    }

    console.log(tx["value"])
    console.log(tx.logs[0])
    for (let activity of nftActivity) {
        // console.log(activity.returnValues)
        if (activity.returnValues.tokenId == tokenId) {
            let txs = await web3.eth.getTransaction(activity.transactionHash)
            console.log(txs)
            // console.log(web3.utils.fromWei(txs.effectiveGasPrice))
            // console.log(txs["value"])
            // console.log(activity.transactionHash)
        }
    }

    return new Promise((resolve) => {
        resolve(data)
    })
}

async function loadNftPrice(txHash) {
    const tx = await web3.eth.getTransactionReceipt(txHash)
    const tokenId = web3.utils.hexToNumber(tx.logs[0].topics[3])
    const price = await window.contract.methods.priceOf(tokenId).call()
    return new Promise((resolve) => {
        resolve(price)
    })
}

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

export { mintNFT, loadMetadata, loadNftPrice }