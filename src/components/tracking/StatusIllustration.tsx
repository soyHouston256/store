import PendienteIllustration from './PendienteIllustration'
import ConfirmadoIllustration from './ConfirmadoIllustration'
import PagadoIllustration from './PagadoIllustration'
import PreparadoIllustration from './PreparadoIllustration'
import EnviadoIllustration from './EnviadoIllustration'
import RecibidoIllustration from './RecibidoIllustration'
import FinalizadoIllustration from './FinalizadoIllustration'
import CanceladoIllustration from './CanceladoIllustration'

const ILLUSTRATIONS: Record<string, () => JSX.Element> = {
    pendiente: PendienteIllustration,
    confirmado: ConfirmadoIllustration,
    pagado: PagadoIllustration,
    preparado: PreparadoIllustration,
    enviado: EnviadoIllustration,
    recibido: RecibidoIllustration,
    finalizado: FinalizadoIllustration,
    cancelado: CanceladoIllustration
}

function StatusIllustration({ status }: { status: string }): JSX.Element | null {
    const Illustration = ILLUSTRATIONS[status]
    if (!Illustration) return null
    return <Illustration />
}

export default StatusIllustration
