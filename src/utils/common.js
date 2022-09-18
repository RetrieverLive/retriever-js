import { createAlchemyWeb3 } from "@alch/alchemy-web3"

const alchemyKey = process.env.REACT_APP_ALCHEMY_KEY
const web3 = createAlchemyWeb3(alchemyKey)

async function updateItemStatus(tokenId, price) {
    const value = web3.utils.toWei(price, 'ether')
    await window.contract.methods
    .listItem(tokenId, value)
    .send({ from: window.ethereum.selectedAddress })
    .on("receipt", (receipt) => {
        return true
    }).on("error", () => {
        return false
    })
}

async function buyNftItem(tokenId, price) {
    const value = web3.utils.toWei(price, 'ether')
    await window.contract.methods
    .buyItem(tokenId)
    .send({ from: window.ethereum.selectedAddress, value: value })
    .on("receipt", (receipt) => {
        return true
    }).on("error", () => {
        return false
    })
}

export { updateItemStatus, buyNftItem }