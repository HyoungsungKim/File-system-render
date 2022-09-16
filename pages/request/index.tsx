import { DashboardContent } from '../../components/dashboard';
import { RequestLayout } from '../../components/requestHandler';

export default function UploadPage() {
    return(
        <RequestLayout />
    )
}

UploadPage.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
}