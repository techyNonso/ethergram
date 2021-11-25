const Ethergram =  artifacts.require("./Ethergram.sol");


require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Ethergram', ([deployer, author, tipper]) => {
    let ethergram;

    before(async () => {
        ethergram = await Ethergram.deployed();
    })

    describe('deployment success', async() => {
        it('deploys successfully', async () => {
            const address = await ethergram.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address,'')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })

        it('has a Ethergram as name', async () => {
            let name  = await ethergram.name()
            assert.equal(name, "Ethergram")
        })
    })

    //test image creation
    describe('image creation', async () => {
        let result, imageCount
        const hash = 'abc123'

        before(async () => {
            result = await ethergram.uploadImage(hash, "Image description",{from: author})
            imageCount = await  ethergram.imageCount()
        })
        it('creates image', async() => {
            //on success
            assert.equal(imageCount,1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
            assert.equal(event.hash, hash, 'Hash is correct')
            assert.equal(event.description, 'Image description', 'description is correct')
            assert.equal(event.giftAmount, '0', 'gift amount is correct')
            assert.equal(event.author, author, 'author is correct')

            //expected failure
            await ethergram.uploadImage('',"Image description", {from: author}).should.be.rejected;
            await ethergram.uploadImage("hash","", {from: author}).should.be.rejected;
        })
             //check from Struct
        it('lists images', async () => {
            const image = await ethergram.images(imageCount)
            assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
            assert.equal(image.hash, hash, 'Hash is correct')
            assert.equal(image.description, 'Image description', 'description is correct')
            assert.equal(image.giftAmount, '0', 'gift amount is correct')
            assert.equal(image.author, author, 'author is correct')
        })


        it('allows users to tip images', async () => {
            // Track the author balance before purchase
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

            result = await ethergram.giftImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

            // SUCCESS
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
            assert.equal(event.hash, hash, 'Hash is correct')
            assert.equal(event.description, 'Image description', 'description is correct')
            assert.equal(event.giftAmount, '1000000000000000000', 'gift amount is correct')
            assert.equal(event.author, author, 'author is correct')

            // Check that author received funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            //expected balance
            let tipImageOwner
            tipImageOwner = web3.utils.toWei('1', 'Ether')
            tipImageOwner = new web3.utils.BN(tipImageOwner)
            const expectedBalance = oldAuthorBalance.add(tipImageOwner)

            assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

            // FAILURE: Tries to gift a image that does not exist
            await ethergram.giftImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        })

        it('allows users to buy images', async () => {
            // Track the author balance before purchase
            let oldAuthorBalance
            oldAuthorBalance = await web3.eth.getBalance(author)
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

            result = await ethergram.buyImage(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

            // SUCCESS
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
            assert.equal(event.hash, hash, 'Hash is correct')
            assert.equal(event.description, 'Image description', 'description is correct')
            assert.equal(event.giftAmount, '0', 'gift amount is correct')
            assert.equal(event.from, author, 'author is correct')
            assert.equal(event.to, tipper, 'buyer is correct')

            // Check that author received funds
            let newAuthorBalance
            newAuthorBalance = await web3.eth.getBalance(author)
            newAuthorBalance = new web3.utils.BN(newAuthorBalance)

            //expected balance
            let buyImageOwner
            buyImageOwner = web3.utils.toWei('1', 'Ether')
            buyImageOwner = new web3.utils.BN(buyImageOwner)
            const expectedBalance = oldAuthorBalance.add(buyImageOwner)

            assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

               
        })
        
    })
})