import React, { useState, useEffect } from 'react';
import { matchesService, EventMatchStatus } from '@/lib/matches.service';
import { eventsService } from '@/lib/events.service';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Heart, Calendar, CheckCircle, Target, Clock, Users, Mail, Loader2 } from 'lucide-react';
import { parse, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Format date to Brazilian format (DD/MM/YYYY)
const formatDateToBR = (dateString: string): string => {
  if (!dateString) return '';
  try {
    // Check if it's already in DD/MM/YYYY format
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateString;
    }
    // Try parsing YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    }
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

interface EventWithStatus extends EventMatchStatus {
  eventDate?: string;
  canSendMatches: boolean;
}

export default function MatchesManagement() {
  const [events, setEvents] = useState<EventWithStatus[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  // Carregar eventos e seus status de matches
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data: allEvents, error } = await eventsService.getEvents();

      if (error) {
        throw error;
      }

      const eventsWithStatus: EventWithStatus[] = [];

      for (const event of allEvents || []) {
        const status = await matchesService.getEventMatchStatus(event.id);
        if (status) {
          const canSend =
            !status.matchesSent &&
            status.finalizedCount > 0 &&
            status.finalizedCount === status.totalParticipants;

          eventsWithStatus.push({
            ...status,
            eventDate: event.date,
            canSendMatches: canSend,
          });
        }
      }

      setEvents(eventsWithStatus);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar eventos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMatches = async () => {
    if (!selectedEventId) return;

    try {
      setSending(true);
      setShowConfirmDialog(false);

      const result = await matchesService.sendMatchesToAll(selectedEventId);

      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: `Matches enviados para ${result.sentCount} participantes`,
        });
        // Recarregar estado
        loadEvents();
        setSelectedEventId(null);
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Falha ao enviar matches',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao enviar matches:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao enviar matches',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const selectedEvent = events.find((e) => e.eventId === selectedEventId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Distribuição de Matches</h2>
        </div>
        <p className="text-gray-600">
          Acompanhe a finalização de participantes e distribua matches quando todos finalizarem
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Nenhum evento disponível</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.eventId}
              className={`border rounded-lg p-6 cursor-pointer transition-all ${
                selectedEventId === event.eventId
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-pink-300'
              }`}
              onClick={() => setSelectedEventId(event.eventId)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{event.eventTitle}</h3>
                  {event.eventDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateToBR(event.eventDate)}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {event.matchesSent ? (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 justify-end">
                      <CheckCircle className="w-4 h-4" />
                      Matches Enviados
                    </div>
                  ) : event.canSendMatches ? (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 justify-end">
                      <Target className="w-4 h-4" />
                      Pronto para Enviar
                    </div>
                  ) : (
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 justify-end">
                      <Clock className="w-4 h-4" />
                      Aguardando
                    </div>
                  )}
                </div>
              </div>

              {/* Indicador de progresso */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Finalização: {event.finalizedCount}/{event.totalParticipants}
                  </span>
                  <span className="text-sm text-gray-600">
                    {event.totalParticipants > 0
                      ? Math.round((event.finalizedCount / event.totalParticipants) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        event.totalParticipants > 0
                          ? (event.finalizedCount / event.totalParticipants) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {selectedEventId === event.eventId && (
                <div className="mt-6 pt-6 border-t">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-gray-700" />
                      <h4 className="font-semibold text-gray-900">
                        Participantes ({event.participants.length})
                      </h4>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {event.participants.map((participant) => (
                        <div
                          key={participant.userId}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded text-sm"
                        >
                          <span className="text-gray-900 font-medium">{participant.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-xs">{participant.email}</span>
                            {participant.finalizado ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Finalizado
                              </span>
                            ) : (
                              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                                Pendente
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!event.matchesSent && (
                    <button
                      onClick={() => setShowConfirmDialog(true)}
                      disabled={!event.canSendMatches || sending}
                      className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        event.canSendMatches && !sending
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-lg'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {sending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : event.canSendMatches ? (
                        <>
                          <Mail className="w-5 h-5" />
                          <span>Enviar Matchs para Todos</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5" />
                          <span>{event.totalParticipants - event.finalizedCount} participante(s) ainda não finalizaram</span>
                        </>
                      )}
                    </button>
                  )}

                  {event.matchesSent && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0" />
                        <p className="text-green-800 text-sm font-semibold">
                          Matches foram enviados com sucesso para todos os participantes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Dialog de confirmação */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Envio de Matches?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação enviará os matches calculados para todos os{' '}
              <strong>{selectedEvent?.totalParticipants}</strong> participantes que finalizaram.
              Os participants receberão um email com a lista de matches. Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-900">
              <strong>Evento:</strong> {selectedEvent?.eventTitle}
            </p>
            <p className="text-sm text-blue-900">
              <strong>Participantes a notificar:</strong> {selectedEvent?.finalizedCount}/
              {selectedEvent?.totalParticipants}
            </p>
          </div>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendMatches}
              disabled={sending}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {sending ? 'Enviando...' : 'Confirmar Envio'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
