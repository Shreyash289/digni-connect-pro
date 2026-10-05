import Layout from '../../components/Layout'
import { NgoGate } from '../../components/ngo'
import DocumentReviewList from '../../components/DocumentReviewList'

export default function DocumentVerification() {
  return (
    <Layout>
      <NgoGate>{() => <DocumentReviewList subtitle="Review and verify documents uploaded by or for your survivors" />}</NgoGate>
    </Layout>
  )
}
