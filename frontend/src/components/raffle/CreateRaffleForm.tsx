import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { Ticket, Clock, Users, Info, Loader2, CheckCircle } from 'lucide-react';
import { useCreateRaffle } from '@/hooks/useCreateRaffle';
import { parseETH, formatETH, cn } from '@/lib/utils';

interface FormData {
  description: string;
  ticketPrice: string;
  maxTickets: string;
  minTickets: string;
  durationDays: string;
  durationHours: string;
}

const initialFormData: FormData = {
  description: '',
  ticketPrice: '0.01',
  maxTickets: '100',
  minTickets: '2',
  durationDays: '7',
  durationHours: '0',
};

export function CreateRaffleForm() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const { createRaffle, isPending, isConfirming, isSuccess, hash, error, reset } =
    useCreateRaffle();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const ticketPrice = parseFloat(formData.ticketPrice);
    if (isNaN(ticketPrice) || ticketPrice <= 0) {
      newErrors.ticketPrice = 'Enter a valid ticket price';
    }

    const maxTickets = parseInt(formData.maxTickets);
    if (formData.maxTickets && (isNaN(maxTickets) || (maxTickets !== 0 && maxTickets < 2))) {
      newErrors.maxTickets = 'Must be 0 (unlimited) or at least 2';
    }

    const minTickets = parseInt(formData.minTickets);
    if (isNaN(minTickets) || minTickets < 0) {
      newErrors.minTickets = 'Must be 0 or greater';
    }

    if (maxTickets > 0 && minTickets > maxTickets) {
      newErrors.minTickets = 'Cannot exceed max tickets';
    }

    const totalHours =
      parseInt(formData.durationDays || '0') * 24 +
      parseInt(formData.durationHours || '0');

    if (totalHours < 1) {
      newErrors.durationHours = 'Duration must be at least 1 hour';
    }
    if (totalHours > 720) {
      // 30 days
      newErrors.durationDays = 'Duration cannot exceed 30 days';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const durationSeconds =
      (parseInt(formData.durationDays || '0') * 24 * 3600 +
        parseInt(formData.durationHours || '0') * 3600);

    createRaffle({
      description: formData.description,
      ticketPrice: parseETH(formData.ticketPrice),
      maxTickets: BigInt(formData.maxTickets || '0'),
      minTickets: BigInt(formData.minTickets || '0'),
      duration: BigInt(durationSeconds),
    });
  };

  // Calculate preview values
  const previewMaxPool =
    parseFloat(formData.ticketPrice || '0') * parseInt(formData.maxTickets || '0');
  const previewFee = previewMaxPool * 0.025;
  const previewPrize = previewMaxPool - previewFee;

  if (isSuccess) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Raffle Created!</h2>
        <p className="text-gray-400 mb-6">
          Your raffle has been created successfully.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              reset();
              setFormData(initialFormData);
            }}
            className="btn-secondary"
          >
            Create Another
          </button>
          <button onClick={() => navigate('/')} className="btn-primary">
            View Raffles
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description / Prize
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="What are you raffling? Describe the prize..."
          rows={3}
          className={cn('input resize-none', errors.description && 'border-red-500')}
        />
        {errors.description && (
          <p className="text-red-400 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Ticket Price */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Ticket className="w-4 h-4 inline mr-2" />
          Ticket Price (ETH)
        </label>
        <input
          type="number"
          name="ticketPrice"
          value={formData.ticketPrice}
          onChange={handleChange}
          step="0.001"
          min="0.0001"
          className={cn('input', errors.ticketPrice && 'border-red-500')}
        />
        {errors.ticketPrice && (
          <p className="text-red-400 text-sm mt-1">{errors.ticketPrice}</p>
        )}
      </div>

      {/* Ticket Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Max Tickets (0 = unlimited)
          </label>
          <input
            type="number"
            name="maxTickets"
            value={formData.maxTickets}
            onChange={handleChange}
            min="0"
            className={cn('input', errors.maxTickets && 'border-red-500')}
          />
          {errors.maxTickets && (
            <p className="text-red-400 text-sm mt-1">{errors.maxTickets}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Min Tickets (0 = no minimum)
          </label>
          <input
            type="number"
            name="minTickets"
            value={formData.minTickets}
            onChange={handleChange}
            min="0"
            className={cn('input', errors.minTickets && 'border-red-500')}
          />
          {errors.minTickets && (
            <p className="text-red-400 text-sm mt-1">{errors.minTickets}</p>
          )}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Clock className="w-4 h-4 inline mr-2" />
          Duration
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="number"
              name="durationDays"
              value={formData.durationDays}
              onChange={handleChange}
              min="0"
              max="30"
              className={cn('input', errors.durationDays && 'border-red-500')}
            />
            <p className="text-xs text-gray-500 mt-1">Days</p>
            {errors.durationDays && (
              <p className="text-red-400 text-sm mt-1">{errors.durationDays}</p>
            )}
          </div>
          <div>
            <input
              type="number"
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
              min="0"
              max="23"
              className={cn('input', errors.durationHours && 'border-red-500')}
            />
            <p className="text-xs text-gray-500 mt-1">Hours</p>
            {errors.durationHours && (
              <p className="text-red-400 text-sm mt-1">{errors.durationHours}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      {parseInt(formData.maxTickets || '0') > 0 && (
        <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
          <div className="flex items-center gap-2 text-gray-400 mb-3">
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">If all tickets sell:</span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Pool</p>
              <p className="text-lg font-bold text-white">
                {previewMaxPool.toFixed(4)} ETH
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Fee (2.5%)</p>
              <p className="text-lg font-bold text-gray-400">
                {previewFee.toFixed(4)} ETH
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Winner Gets</p>
              <p className="text-lg font-bold text-green-400">
                {previewPrize.toFixed(4)} ETH
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isConnected || isPending || isConfirming}
        className="btn-primary w-full py-3"
      >
        {isPending || isConfirming ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isPending ? 'Confirm in Wallet...' : 'Creating...'}
          </>
        ) : !isConnected ? (
          'Connect Wallet to Create'
        ) : (
          'Create Raffle'
        )}
      </button>
    </form>
  );
}
