import { DashboardContent } from '../../components/dashboard';
import { ERC721Handler } from '../../components/deprecated/NFTmintingHandler';

export default function mintNFT() {
    return(
        <ERC721Handler title="Mint NFT"/>
    )
}

mintNFT.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
  }