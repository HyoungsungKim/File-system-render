import { DashboardContent } from '../../components/dashboard';
import { UploadLayout } from '../../components/uploadHandler';

export default function UploadPage() {
    return(
        <UploadLayout />
    )
}

UploadPage.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
}