import { DashboardContent } from '../../components/dashboard';
import { UploadAndMintLayout } from '../../components/uploadAndMintHandler';

export default function UploadPage() {
    return(
        <UploadAndMintLayout />
    )
}

UploadPage.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
}