import { DashboardContent } from '../../components/dashboard';
import { ReportLayout } from '../../components/reportHandler';

export default function UploadPage() {
    return(
        <ReportLayout />
    )
}

UploadPage.getLayout = function getLayout() {
    return (
      <DashboardContent />
    )
}