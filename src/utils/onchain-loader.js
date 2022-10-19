import { createAlchemyWeb3 } from "@alch/alchemy-web3"
import contractABI from '../test-abi.json'
const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const web3 = createAlchemyWeb3(alchemyKey)
const contractAddress = "0xAB8c361D9f7Fd5f0C32261F625a7C181adD6C5e5"

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
    return new Promise((resolve) => {
        resolve(data)
    })
}

async function getItemActivity(activities, tokenId) {
    let temp = ''
    for (let activity of activities) {
        if (activity.returnValues.tokenId == tokenId) {
            if (activity.returnValues.from != null) {
                let to = activity.returnValues.to.slice(0, 5) + '...' + activity.returnValues.to.slice(-4, activity.returnValues.to.length)
                let from = activity.returnValues.from.slice(0, 5) + '...' + activity.returnValues.from.slice(-4, activity.returnValues.from.length)
                if (activity.returnValues.from == '0x0000000000000000000000000000000000000000') {
                    temp = `
                        <div class="details-contents">
                            <span><i class="fas fa-seedling fa-bounce"></i> Mint</span>
                            ${to}
                        </div>
                    `
                    document.getElementById("nft-activity").innerHTML += temp;
                } else {
                    temp = `
                        <div class="details-contents">
                            <span><i class="fas fa-plane"></i> Transfer</span>
                            <span> ${from}  <i class="fas fa-arrow-right"></i>  ${to} </span>
                        </div>
                    `
                    document.getElementById("nft-activity").innerHTML += temp;
                }
            }
        }
    }
}

async function getPriceHistory(activities, tokenId) {
    let pHistory = []
    for (let activity of activities) {
        if (activity.returnValues.tokenId == tokenId) {
            if (activity.event === "Transfer") {
                let tx = await web3.eth.getTransaction(activity.transactionHash)
                if (tx.value != "0") {
                    pHistory.push({ name: "", price: web3.utils.fromWei(tx.value, "ether") })
                }
            }
        }
    }
    if (pHistory.length != 0) {
        return pHistory;
    } else {
        console.log("EMPTY")
    }
    
}

async function getCurrentPrice(price) {
    if (price == 0) {
        return "NOT FOR SALE"
    } else {
        return price+" ETH"
    }
}

async function loadCID(txHash) {
    const res = await web3.eth.getTransactionReceipt(txHash);
    const tokenId = web3.utils.hexToNumber(res.logs[0].topics[3]);
    const metadata = await web3.alchemy.getNftMetadata({
        contractAddress: contractAddress,
        tokenId: tokenId,
    })
    // console.log(metadata)
    // return metadata
    return new Promise((resolve) => {
        resolve(metadata)
    })
}

export { loadMetadata, getItemActivity, getPriceHistory, getCurrentPrice, loadCID }