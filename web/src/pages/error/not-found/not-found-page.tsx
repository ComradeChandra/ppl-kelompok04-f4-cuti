import { ErrorPanel } from '../../../components/error/error-panel'

export default function NotFoundPage() {
  return <ErrorPanel code="404" title="Halaman tidak ditemukan" description="Alamat yang Anda buka tidak tersedia." />
}
