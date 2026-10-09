import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheckIcon, RefreshCwIcon, SparklesIcon, TriangleAlertIcon } from 'lucide-react';
import type { AIReviewResult } from '../../types/procurement';
import { standardizeRequest } from '../../utils/aiStandardizer';
import type { AISuggestion } from '../../utils/aiStandardizer';
import { textareaClass } from '../../utils/styles';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';

import { formatVND } from '../../utils/format';

type Phase = 'idle' | 'loading' | 'suggestion' | 'none' | 'error';

interface AIStandardizerPanelProps {
  aiReview: AIReviewResult;
  onApply: (s: AISuggestion) => void;
  onDismiss: () => void;
}

export function AIStandardizerPanel({ aiReview, onApply, onDismiss }: AIStandardizerPanelProps) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [error, setError] = useState('');
  const [inputError, setInputError] = useState('');

  const run = async () => {
    if (text.trim().length < 10) {
      setInputError('Mô tả nhu cầu tối thiểu 10 ký tự để AI phân tích.');
      return;
    }
    setInputError('');
    setPhase('loading');
    try {
      const res = await standardizeRequest(text);
      setSuggestion(res);
      setPhase(res ? 'suggestion' : 'none');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI không phản hồi. Vui lòng thử lại.');
      setPhase('error');
    }
  };

  const statusTag =
  aiReview === 'accepted' ?
  <Tag tone="success" icon={<CircleCheckIcon className="h-3 w-3" aria-hidden />}>Đã áp dụng gợi ý</Tag> :
  aiReview === 'edited' ?
  <Tag tone="primary">Đã áp dụng · bạn đã chỉnh sửa</Tag> :
  aiReview === 'dismissed' ?
  <Tag>Đã bỏ qua gợi ý</Tag> :
  null;

  return (
    <section className="rounded-lg border border-info-200 bg-info-50 p-5" aria-labelledby="ai-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="ai-title" className="inline-flex items-center gap-2 text-base font-semibold text-ink-900">
          <SparklesIcon className="h-4 w-4 text-info-600" aria-hidden />
          AI PR Standardizer
        </h2>
        {statusTag}
      </div>
      <p className="mt-1 text-sm text-ink-700">Mô tả nhu cầu bằng ngôn ngữ tự nhiên. AI chuẩn hóa tiêu đề, Category, thông số, ngày cần hàng, địa điểm giao hàng và đơn giá dự toán tự động điền vào Form khi bạn bấm "Use this".</p>

      <label htmlFor="ai-text" className="sr-only">
        Mô tả nhu cầu
      </label>
      <textarea
        id="ai-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="VD: Cần 5 laptop cấu hình mạnh cho kỹ sư mới, chạy được Docker, giao tại văn phòng tầng 8"
        className={`${textareaClass(Boolean(inputError))} mt-3 min-h-[72px]`}
        disabled={phase === 'loading'} />
      
      {inputError && <p className="mt-1.5 text-xs text-danger-600">{inputError}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" icon={<SparklesIcon className="h-4 w-4" aria-hidden />} onClick={run} loading={phase === 'loading'}>
          {phase === 'loading' ? 'AI đang phân tích…' : 'Chuẩn hóa bằng AI'}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'suggestion' && suggestion &&
        <motion.div
          key="suggestion"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="mt-4 rounded-lg border border-info-200 bg-white p-4">
          
            <p className="text-xs font-medium text-info-600">Gợi ý của AI · cần bạn review</p>
            <dl className="mt-2 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-500">Tiêu đề</dt>
                <dd className="font-medium text-ink-900">{suggestion.title}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500">Category</dt>
                <dd className="font-medium text-ink-900">{suggestion.category}</dd>
              </div>
              {suggestion.requiredBy && (
                <div>
                  <dt className="text-xs text-ink-500">Ngày cần hàng</dt>
                  <dd className="font-medium text-ink-900">{suggestion.requiredBy}</dd>
                </div>
              )}
              {suggestion.deliveryLocation && (
                <div>
                  <dt className="text-xs text-ink-500">Địa điểm giao hàng</dt>
                  <dd className="font-medium text-ink-900">{suggestion.deliveryLocation}</dd>
                </div>
              )}
              {suggestion.budgetCode && (
                <div>
                  <dt className="text-xs text-ink-500">Mã ngân sách</dt>
                  <dd className="font-medium text-ink-900">{suggestion.budgetCode}</dd>
                </div>
              )}
              {suggestion.costCenter && (
                <div>
                  <dt className="text-xs text-ink-500">Trung tâm chi phí</dt>
                  <dd className="font-medium text-ink-900">{suggestion.costCenter}</dd>
                </div>
              )}
            </dl>
            <ul className="mt-3 space-y-2">
              {suggestion.items.map((i) =>
                <li key={i.name} className="text-sm">
                  <span className="font-medium text-ink-900">
                    {i.quantity} {i.unit} · {i.name} {i.estUnitPrice ? `· ${formatVND(i.estUnitPrice)}` : ''}
                  </span>
                  <span className="block text-xs text-ink-500">{i.specs}</span>
                </li>
              )}
            </ul>
            <div className="mt-3 border-t border-hairline pt-3">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-warning-700">
                <TriangleAlertIcon className="h-3.5 w-3.5" aria-hidden />
                Thông tin còn thiếu
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs text-ink-700">
                {suggestion.missing.map((m) =>
              <li key={m}>{m}</li>
              )}
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onApply(suggestion);
                setPhase('idle');
              }}>
              
                Use this
              </Button>
              <Button
              variant="tertiary"
              size="sm"
              onClick={() => {
                onDismiss();
                setPhase('idle');
              }}>
              
                Dismiss
              </Button>
            </div>
          </motion.div>
        }
        {phase === 'none' &&
        <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 text-sm text-ink-700">
            AI chưa nhận diện được sản phẩm từ mô tả này. Bạn có thể nhập thủ công bên dưới hoặc mô tả cụ thể hơn (tên thiết bị, số lượng).
          </motion.p>
        }
        {phase === 'error' &&
        <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 flex flex-wrap items-center gap-3 text-sm text-danger-600" role="alert">
            <span>{error}</span>
            <Button variant="link" size="sm" icon={<RefreshCwIcon className="h-3.5 w-3.5" aria-hidden />} onClick={run}>
              Thử lại
            </Button>
          </motion.div>
        }
      </AnimatePresence>
    </section>);

}