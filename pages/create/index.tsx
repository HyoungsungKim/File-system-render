import { DashboardContent } from '../../components/dashboard';
import { CreateLayout } from '../../components/createHandler';

export default function UploadPage() {
    return(
        <CreateLayout />
    )
}

UploadPage.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
}