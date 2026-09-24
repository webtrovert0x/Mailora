'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMailbox } from '@/hooks/useMailbox'
import { uploadToIPFS, fetchFromIPFS, uploadFileToIPFS } from '@/utils/ipfs'
import { encryptMessage, decryptMessage } from '@/utils/crypto'
import { getExplorerAddressUrl, getExplorerTxUrl } from '@/utils/abi'
import { AISecurityBanner } from '@/components/ai/AISecurityBanner'
import { AISummaryCard } from '@/components/ai/AISummaryCard'
import { AISmartReplies } from '@/components/ai/AISmartReplies'
import { AIComposeAssistant } from '@/components/ai/AIComposeAssistant'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Inbox, 
  PenSquare, 
  Send, 
  RefreshCw, 
  Key, 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Settings, 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  FileText, 
  Archive as ArchiveIcon, 
  ArrowLeft, 
  Menu, 
  X,
  Paperclip, 
  BadgeCheck,
  ExternalLink,
  Sparkles,
  Wand2,
  Lock,
  Download,
  Reply,
  Fingerprint,
  LogOut,
  AlertCircle,
  Coins,
  Zap,
  Clock,
  Calendar,
  Bell,
  ChevronDown,
  Check,
  SendHorizontal
} from 'lucide-react'
import { useBalance, useDisconnect } from 'wagmi'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'

export default function Dashboard() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({ address: address as `0x${string}` | undefined })
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose' | 'contacts' | 'archive' | 'scheduled' | 'snoozed'>('inbox')
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null)
  
  // Search
  const [searchQuery, setSearchQuery] = useState('')

  // Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Archive & Snooze
  const [archivedCids, setArchivedCids] = useState<string[]>([])
  const [snoozedCids, setSnoozedCids] = useState<string[]>([])
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false)

  const { 
    sendMessage, 
    sendGaslessMessage,
    sendNativePayment,
    signMessageText, 
    getMyMessages, 
    getSentMessages, 
    getMyAlias, 
    registerAlias, 
    registerGaslessAlias,
    checkAliasAvailability, 
    resolveAlias, 
    getAliasForAddress 
  } = useMailbox()

  const [myAlias, setMyAlias] = useState<string | null>(null)
  const [loadingAlias, setLoadingAlias] = useState(true)
  
  // Inbox State
  const [messages, setMessages] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [inboxPage, setInboxPage] = useState(1)

  // Sent State
  const [sentMessages, setSentMessages] = useState<any[]>([])
  const [loadingSent, setLoadingSent] = useState(true)
  const [sentPage, setSentPage] = useState(1)

  // Scheduled State
  const [scheduledList, setScheduledList] = useState<any[]>([])
  const [loadingScheduled, setLoadingScheduled] = useState(false)
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)

  const ITEMS_PER_PAGE = 8;

  // Contacts State
  const [contacts, setContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)
  const [newContactAlias, setNewContactAlias] = useState('')
  const [isAddingContact, setIsAddingContact] = useState(false)

  // Compose State
  const [recipients, setRecipients] = useState<string[]>([])
  const [recipientInput, setRecipientInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [messageSubject, setMessageSubject] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [isSending, setIsSending] = useState(false)

  // Feature 1: Token & BOT Payments
  const [attachPayment, setAttachPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')

  // Feature 4: Gasless Relayer Mode
  const [isGaslessMode, setIsGaslessMode] = useState(false)

  // Register State
  const [registerInput, setRegisterInput] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  // Settings & Notifications State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [emailPref, setEmailPref] = useState('')
  const [telegramPref, setTelegramPref] = useState('')
  const [webPushPref, setWebPushPref] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const loadArchive = async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/archive?owner=${address}`);
      const data = await res.json();
      if (data.cids) setArchivedCids(data.cids);
    } catch (e) {
      console.error(e);
    }
  }

  const loadSnoozed = async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/snooze?owner=${address}`);
      const data = await res.json();
      if (data.snoozed) {
        setSnoozedCids(data.snoozed.map((s: any) => s.cid));
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleArchive = async (cid: string) => {
    if (!address) return;
    try {
      const res = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerAddress: address, cid })
      });
      const data = await res.json();
      if (res.ok) {
        setArchivedCids(data.cids);
        toast.success("Message archived");
        setSelectedMessage(null);
      }
    } catch (e) {
      toast.error("Failed to archive message");
    }
  }

  const handleUnarchive = async (cid: string) => {
    if (!address) return;
    try {
      const res = await fetch(`/api/archive?owner=${address}&cid=${cid}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setArchivedCids(data.cids);
        toast.success("Message unarchived");
        setSelectedMessage(null);
      }
    } catch (e) {
      toast.error("Failed to unarchive message");
    }
  }

  const handleSnooze = async (cid: string, hours: number) => {
    if (!address) return;
    try {
      const snoozeUntil = new Date(Date.now() + hours * 3600 * 1000);
      const res = await fetch('/api/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerAddress: address, cid, snoozeUntil })
      });
      if (res.ok) {
        setSnoozedCids(prev => [...prev, cid]);
        toast.success(`Message snoozed for ${hours >= 24 ? `${hours / 24} day(s)` : `${hours} hour(s)`}`);
        setShowSnoozeMenu(false);
        setSelectedMessage(null);
      }
    } catch (e) {
      toast.error("Failed to snooze message");
    }
  }

  const handleUnsnooze = async (cid: string) => {
    if (!address) return;
    try {
      const res = await fetch(`/api/snooze?owner=${address}&cid=${cid}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSnoozedCids(prev => prev.filter(c => c !== cid));
        toast.success("Message returned to Inbox");
        setSelectedMessage(null);
      }
    } catch (e) {
      toast.error("Failed to unsnooze message");
    }
  }

  const loadScheduled = async () => {
    if (!address) return;
    setLoadingScheduled(true);
    try {
      const res = await fetch(`/api/scheduled?owner=${address}`);
      const data = await res.json();
      if (data.scheduled) setScheduledList(data.scheduled);
    } catch (e) {
      console.error(e);
    }
    setLoadingScheduled(false);
  }

  const handleDeleteScheduled = async (id: string) => {
    if (!address) return;
    try {
      const res = await fetch(`/api/scheduled?owner=${address}&id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Scheduled message cancelled");
        loadScheduled();
      }
    } catch (e) {
      toast.error("Failed to cancel scheduled message");
    }
  }

  const loadSettings = async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/preferences?owner=${address}`);
      const data = await res.json();
      if (data.email) setEmailPref(data.email);
      if (data.telegramChatId) setTelegramPref(data.telegramChatId);
      if (data.webPushEnabled !== undefined) setWebPushPref(data.webPushEnabled);
    } catch (e) {
      console.error(e);
    }
  }

  const saveSettings = async () => {
    if (!address) return;
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ownerAddress: address, 
          email: emailPref,
          telegramChatId: telegramPref,
          webPushEnabled: webPushPref
        })
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Preferences saved successfully");
      setIsSettingsOpen(false);
    } catch (e) {
      toast.error("Error saving settings");
    }
    setIsSavingSettings(false);
  }

  useEffect(() => {
    const checkAvailability = async () => {
      const cleanAlias = registerInput.replace('@mailora', '').replace('@cmail.com', '').toLowerCase().trim()
      if (!cleanAlias || cleanAlias.length < 3) {
        setIsAvailable(null)
        return
      }
      setIsChecking(true)
      const available = await checkAliasAvailability(cleanAlias)
      setIsAvailable(available)
      setIsChecking(false)
    }

    const timeout = setTimeout(checkAvailability, 400)
    return () => clearTimeout(timeout)
  }, [registerInput])

  useEffect(() => {
    setMounted(true)
    if (mounted && !isConnected) {
      router.push('/')
    }
  }, [isConnected, mounted, router])

  useEffect(() => {
    if (isConnected && address) {
      setLoadingAlias(true)
      getMyAlias()
        .then(alias => {
          setMyAlias(alias)
          if (alias) {
            loadInbox()
            loadSentMessages()
            loadContacts()
            loadArchive()
            loadSnoozed()
            loadScheduled()
            loadSettings()
            loadDraft()
          }
        })
        .catch(() => setMyAlias(null))
        .finally(() => setLoadingAlias(false))
    }
  }, [isConnected, address])

  const addRecipient = (rawVal: string) => {
    const val = rawVal.trim()
    if (!val) return
    let formatted = val.toLowerCase()
    if (!formatted.includes('@') && !formatted.startsWith('0x')) {
      formatted = `${formatted}@mailora`
    }
    if (!recipients.includes(formatted)) {
      setRecipients(prev => [...prev, formatted])
    }
    setRecipientInput('')
    setShowSuggestions(false)
  }

  const removeRecipient = (indexToRemove: number) => {
    setRecipients(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleRecipientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['Enter', ',', ' ', 'Tab'].includes(e.key)) {
      e.preventDefault()
      if (recipientInput.trim()) {
        addRecipient(recipientInput.trim().replace(/,$/, ''))
      }
    } else if (e.key === 'Backspace' && !recipientInput && recipients.length > 0) {
      removeRecipient(recipients.length - 1)
    }
  }

  const loadDraft = async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/drafts?owner=${address}`);
      const data = await res.json();
      if (data.draft) {
        if (data.draft.toAlias) {
          const parts = data.draft.toAlias.split(',').map((s: string) => s.trim()).filter(Boolean);
          setRecipients(parts);
        }
        if (data.draft.content) {
          setMessageContent(data.draft.content);
        }
      }
    } catch (e) {
      console.error("Failed to load draft");
    }
  }

  // Auto-save draft effect
  useEffect(() => {
    if (!address || (activeTab !== 'compose')) return;
    
    const saveDraft = async () => {
      const allRecipients = [...recipients];
      if (recipientInput.trim()) {
        const formatted = recipientInput.trim().includes('@') || recipientInput.trim().startsWith('0x')
          ? recipientInput.trim().toLowerCase()
          : `${recipientInput.trim().toLowerCase()}@mailora`;
        if (!allRecipients.includes(formatted)) allRecipients.push(formatted);
      }
      if (allRecipients.length === 0 && !messageContent) return;
      try {
        await fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownerAddress: address,
            toAlias: allRecipients.join(', '),
            content: messageContent
          })
        });
      } catch (e) {}
    };

    const interval = setInterval(saveDraft, 5000);
    return () => clearInterval(interval);
  }, [address, recipients, recipientInput, messageContent, activeTab]);

  // Polling for new messages
  useEffect(() => {
    if (!address || !myAlias) return;
    
    const pollMessages = async () => {
      try {
        const rawMessages = await getMyMessages();
        if (rawMessages.length > messages.length && messages.length > 0) {
          const newMsgCount = rawMessages.length - messages.length;
          toast(`You have ${newMsgCount} new encrypted message(s)!`, {
            icon: '📬',
            style: { borderRadius: '16px', background: '#09151e', color: '#34d399', border: '1px solid #059669' },
            duration: 5000,
          });
          loadInbox();
        }
      } catch (e) {}
    };

    const interval = setInterval(pollMessages, 30000);
    return () => clearInterval(interval);
  }, [address, messages.length, myAlias]);

  const loadInbox = async (page = inboxPage) => {
    if (!address) return;
    setLoadingMessages(true)
    try {
      const rawMessages = await getMyMessages()
      rawMessages.sort((a, b) => b.timestamp - a.timestamp)
      
      const paginatedRaw = rawMessages.slice(0, page * ITEMS_PER_PAGE)
      
      const decryptedMsgs = await Promise.all(paginatedRaw.map(async (msg) => {
        let senderAlias = null
        try {
          senderAlias = await getAliasForAddress(msg.sender as string)
        } catch (e) {}

        try {
          const encryptedBase64 = await fetchFromIPFS(msg.contentCID as string)
          const decrypted = await decryptMessage(encryptedBase64, msg.sender as string, address as string)
          return { ...msg, decryptedPayload: decrypted, senderAlias }
        } catch (e) {
          return { ...msg, decryptedPayload: { text: "Failed to load or decrypt IPFS content", isVerified: false }, senderAlias }
        }
      }))
      setMessages(decryptedMsgs)
    } catch (e) {
      console.error(e)
    }
    setLoadingMessages(false)
  }

  const loadSentMessages = async (page = sentPage) => {
    if (!address) return;
    setLoadingSent(true)
    try {
      const rawMessages = await getSentMessages()
      rawMessages.sort((a, b) => b.timestamp - a.timestamp)
      
      const paginatedRaw = rawMessages.slice(0, page * ITEMS_PER_PAGE)
      
      const decryptedMsgs = await Promise.all(paginatedRaw.map(async (msg) => {
        let recipientAlias = null
        try {
          recipientAlias = await getAliasForAddress(msg.recipient as string)
        } catch (e) {}

        try {
          const encryptedBase64 = await fetchFromIPFS(msg.contentCID as string)
          const decrypted = await decryptMessage(encryptedBase64, address as string, msg.recipient as string)
          return { ...msg, decryptedPayload: decrypted, recipientAlias }
        } catch (e) {
          return { ...msg, decryptedPayload: { text: "Failed to load or decrypt IPFS content", isVerified: false }, recipientAlias }
        }
      }))
      setSentMessages(decryptedMsgs)
    } catch (e) {
      console.error(e)
    }
    setLoadingSent(false)
  }

  const loadContacts = async () => {
    if (!address) return;
    setLoadingContacts(true)
    try {
      const res = await fetch(`/api/contacts?owner=${address}`)
      const data = await res.json()
      if (data.contacts) {
        setContacts(data.contacts)
      }
    } catch (e) {
      console.error(e)
    }
    setLoadingContacts(false)
  }

  const handleAddContact = async () => {
    if (!newContactAlias || !address) return;
    setIsAddingContact(true)
    try {
      const cleanAlias = newContactAlias.replace('@mailora', '').replace('@cmail.com', '').toLowerCase().trim()
      const contactAddress = await resolveAlias(cleanAlias)
      
      if (!contactAddress) {
        throw new Error(`The alias '${cleanAlias}' does not exist on BotChain!`)
      }

      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress: address,
          alias: cleanAlias,
          contactAddress: contactAddress
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Added ${cleanAlias}@mailora to your contacts!`)
      setNewContactAlias('')
      loadContacts()
    } catch (e: any) {
      toast.error(e.message || "Failed to add contact")
    }
    setIsAddingContact(false)
  }

  const handleDeleteContact = async (alias: string) => {
    if (!address) return;
    try {
      const res = await fetch(`/api/contacts?owner=${address}&alias=${alias}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success(`Removed ${alias} from contacts`)
        loadContacts()
      }
    } catch (e: any) {
      toast.error("Failed to delete contact")
    }
  }

  const handleScheduleSend = async (hoursFromNow: number) => {
    const targetRecipients = [...recipients];
    if (recipientInput.trim()) {
      const formatted = recipientInput.trim().includes('@') || recipientInput.trim().startsWith('0x')
        ? recipientInput.trim().toLowerCase()
        : `${recipientInput.trim().toLowerCase()}@mailora`;
      if (!targetRecipients.includes(formatted)) {
        targetRecipients.push(formatted);
      }
    }

    if (targetRecipients.length === 0) {
      toast.error("Please specify at least one recipient");
      return;
    }
    if (!messageContent || !address) {
      toast.error("Please provide message content");
      return;
    }

    const sendAt = new Date(Date.now() + hoursFromNow * 3600 * 1000);
    try {
      const res = await fetch('/api/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress: address,
          recipients: targetRecipients,
          subject: messageSubject,
          content: messageContent,
          paymentAmount: attachPayment ? paymentAmount : '',
          sendAt
        })
      });
      if (!res.ok) throw new Error("Failed to schedule message");
      toast.success(`Message scheduled for ${sendAt.toLocaleString()}!`);
      setShowSchedulePicker(false);
      setRecipients([]);
      setRecipientInput('');
      setMessageSubject('');
      setMessageContent('');
      setAttachmentFile(null);
      setAttachPayment(false);
      setPaymentAmount('');
      setActiveTab('scheduled');
      loadScheduled();
    } catch (e: any) {
      toast.error(e.message || "Failed to schedule dispatch");
    }
  }

  const handleSend = async () => {
    // Gather all target recipients including any typed input not yet added as chip
    const targetRecipients = [...recipients];
    if (recipientInput.trim()) {
      const formatted = recipientInput.trim().includes('@') || recipientInput.trim().startsWith('0x')
        ? recipientInput.trim().toLowerCase()
        : `${recipientInput.trim().toLowerCase()}@mailora`;
      if (!targetRecipients.includes(formatted)) {
        targetRecipients.push(formatted);
      }
    }

    if (targetRecipients.length === 0) {
      toast.error("Please specify at least one recipient");
      return;
    }
    if (!messageContent || !address) {
      toast.error("Please provide message content");
      return;
    }
    setIsSending(true)
    try {
      // 1. Sign Message with connected wallet once
      let signature;
      try {
        signature = await signMessageText(messageContent);
      } catch (e) {
        throw new Error("You must sign the message to prove wallet authenticity.");
      }

      // 2. Upload Attachment if exists once
      let attachmentCID;
      if (attachmentFile) {
        if (attachmentFile.size > 5 * 1024 * 1024) {
          throw new Error("Attachment exceeds 5MB limit");
        }
        const loadingId = toast.loading("Encrypting & pinning attachment to IPFS...");
        attachmentCID = await uploadFileToIPFS(attachmentFile);
        toast.dismiss(loadingId);
      }

      const sendToastId = toast.loading(`Encrypting & dispatching to ${targetRecipients.length} recipient(s)...`);

      // 3. Process Send to each recipient on BotChain
      for (const rec of targetRecipients) {
        const cleanToAlias = rec.replace('@mailora', '').replace('@cmail.com', '').toLowerCase().trim()
        
        let recipientAddress = rec.startsWith('0x') && rec.length === 42 ? rec : null;
        if (!recipientAddress) {
          recipientAddress = await resolveAlias(cleanToAlias);
        }

        if (!recipientAddress) {
          throw new Error(`The recipient '${cleanToAlias}' was not found on BotChain!`);
        }

        // Feature 1: Process BOT Payment if attached
        let paymentInfo = null;
        if (attachPayment && Number(paymentAmount) > 0) {
          try {
            const payTxHash = await sendNativePayment(recipientAddress, paymentAmount);
            paymentInfo = {
              amount: paymentAmount,
              symbol: 'BOT',
              txHash: payTxHash,
              sender: address
            };
          } catch (payErr: any) {
            throw new Error(`BOT transfer failed: ${payErr.message}`);
          }
        }

        // Structure Payload
        const payload = {
          subject: messageSubject.trim() || 'Encrypted Mailora Message',
          text: messageContent,
          signature,
          attachmentCID,
          payment: paymentInfo,
          recipients: targetRecipients
        };

        const encrypted = await encryptMessage(JSON.stringify(payload), address, recipientAddress);
        const cid = await uploadToIPFS(encrypted);

        // Feature 4: Dispatch via Gasless Relayer or Direct Contract call
        if (isGaslessMode) {
          await sendGaslessMessage(cleanToAlias, cid);
        } else {
          await sendMessage(cleanToAlias, cid);
        }
        
        // Feature 7: Web2 Email & Telegram Notification Bridge
        fetch('/api/notifications/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientAddress,
            senderAlias: myAlias ? `${myAlias}@mailora` : "Anonymous"
          })
        }).catch(() => {});

        fetch('/api/notifications/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientAddress,
            senderAlias: myAlias ? `${myAlias}@mailora` : "Anonymous",
            subject: messageSubject.trim() || 'Encrypted Mailora Message',
            summary: messageContent.replace(/<[^>]*>?/gm, '').slice(0, 100)
          })
        }).catch(() => {});
      }

      toast.dismiss(sendToastId);
      toast.success(
        attachPayment && Number(paymentAmount) > 0
          ? `Dispatched with ${paymentAmount} BOT payment on BotChain!`
          : `Encrypted & dispatched to ${targetRecipients.length} recipient(s) on BotChain!`
      );
      
      // Delete draft after sending
      fetch(`/api/drafts?owner=${address}`, { method: 'DELETE' }).catch(() => {});
      
      setRecipients([])
      setRecipientInput('')
      setMessageSubject('')
      setMessageContent('')
      setAttachmentFile(null)
      setAttachPayment(false)
      setPaymentAmount('')
      setActiveTab('sent')
      loadSentMessages()
    } catch (e: any) {
      toast.error(e.message || "Failed to send message")
    }
    setIsSending(false)
  }

  const handleRegister = async (gasless = false) => {
    if (!registerInput || !address) return;
    const cleanAlias = registerInput.replace('@mailora', '').replace('@cmail.com', '').toLowerCase().trim()
    
    if (!cleanAlias || cleanAlias.length < 3) {
      toast.error("Alias must be at least 3 characters long");
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(cleanAlias)) {
      toast.error("Alias can only contain lowercase letters, numbers, hyphens, and underscores");
      return;
    }

    setIsRegistering(true)
    try {
      if (gasless) {
        await registerGaslessAlias(cleanAlias)
      } else {
        await registerAlias(cleanAlias)
      }
      toast.success(`Identity claimed: ${cleanAlias}@mailora!`)
      setMyAlias(cleanAlias)
      setRegisterInput('')
      loadInbox()
      loadSentMessages()
      loadContacts()
      loadArchive()
      loadSnoozed()
      loadScheduled()
      loadSettings()
      loadDraft()
    } catch (e: any) {
      toast.error(e.message || "Registration failed on-chain")
    }
    setIsRegistering(false)
  }

  const handleReplyTo = (senderAliasOrAddress: string, initialReplyText = '') => {
    const formatted = senderAliasOrAddress.includes('@') || senderAliasOrAddress.startsWith('0x')
      ? senderAliasOrAddress
      : `${senderAliasOrAddress}@mailora`;
    setRecipients([formatted]);
    setRecipientInput('');
    setMessageSubject(`Re: ${selectedMessage?.decryptedPayload?.subject || 'Message'}`);
    if (initialReplyText) {
      setMessageContent(initialReplyText);
    }
    setSelectedMessage(null);
    setActiveTab('compose');
  }

  if (!mounted || !isConnected) return null

  // Filter messages based on search query
  const getFilteredMessages = (list: any[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(m => {
      const alias = (m.senderAlias || m.recipientAlias || '').toLowerCase();
      const addr = (m.sender || m.recipient || '').toLowerCase();
      const text = (m.decryptedPayload?.text || '').toLowerCase();
      const subj = (m.decryptedPayload?.subject || '').toLowerCase();
      return alias.includes(q) || addr.includes(q) || text.includes(q) || subj.includes(q);
    });
  }

  const inboxList = getFilteredMessages(messages.filter(m => !archivedCids.includes(m.contentCID) && !snoozedCids.includes(m.contentCID)));
  const sentList = getFilteredMessages(sentMessages);
  const archiveList = getFilteredMessages(messages.filter(m => archivedCids.includes(m.contentCID)));
  const snoozedList = getFilteredMessages(messages.filter(m => snoozedCids.includes(m.contentCID)));

  return (
    <div className="flex h-screen bg-[#06090e] text-slate-100 overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Background Subtle Gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#090e17]/90 backdrop-blur-2xl border-r border-white/5 flex flex-col justify-between p-4 transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-6">
          {/* Logo & Network Status */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-emerald-500/20 border border-emerald-500/30 ring-2 ring-emerald-500/20">
                <img src="/logo.png" alt="Mailora Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Mailora
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    AI
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  BOT Chain (677)
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Compose Button */}
          <button
            onClick={() => {
              setSelectedMessage(null)
              setActiveTab('compose')
              setIsMobileMenuOpen(false)
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            <PenSquare size={16} />
            New Encrypted Message
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => {
                setSelectedMessage(null)
                setActiveTab('inbox')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'inbox'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox size={16} />
                <span>Inbox</span>
              </div>
              {inboxList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">
                  {inboxList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedMessage(null)
                setActiveTab('sent')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'sent'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Send size={16} />
                <span>Sent</span>
              </div>
              {sentList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400 font-mono">
                  {sentList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedMessage(null)
                setActiveTab('scheduled')
                setIsMobileMenuOpen(false)
                loadScheduled()
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'scheduled'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock size={16} />
                <span>Scheduled</span>
              </div>
              {scheduledList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-[10px] font-bold text-teal-300">
                  {scheduledList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedMessage(null)
                setActiveTab('snoozed')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'snoozed'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={16} />
                <span>Snoozed</span>
              </div>
              {snoozedList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400 font-mono">
                  {snoozedList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedMessage(null)
                setActiveTab('archive')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'archive'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ArchiveIcon size={16} />
                <span>Archived</span>
              </div>
              {archiveList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400 font-mono">
                  {archiveList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedMessage(null)
                setActiveTab('contacts')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === 'contacts'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users size={16} />
                <span>Address Book</span>
              </div>
              {contacts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400 font-mono">
                  {contacts.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* User Identity & Settings Box */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          {/* Identity Card */}
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Identity</span>
              <span className="text-[10px] font-mono text-emerald-400">
                {balanceData ? `${Number(balanceData.formatted).toFixed(3)} ${balanceData.symbol}` : 'BOT'}
              </span>
            </div>
            <div className="font-semibold text-xs text-slate-200 truncate">
              {myAlias ? `${myAlias}@mailora` : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-white/5"
            >
              <Settings size={14} />
              Settings
            </button>
            <button
              onClick={() => open()}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 transition-colors border border-white/5"
              title="Manage Wallet"
            >
              <Fingerprint size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#06090e] overflow-hidden">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between gap-4 shrink-0 bg-[#090e17]/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 text-slate-300"
            >
              <Menu size={18} />
            </button>

            {selectedMessage ? (
              <button
                onClick={() => setSelectedMessage(null)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Back to {activeTab}</span>
              </button>
            ) : (
              <h2 className="text-base font-bold capitalize text-white flex items-center gap-2">
                {activeTab === 'inbox' && <Inbox size={18} className="text-emerald-400" />}
                {activeTab === 'sent' && <Send size={18} className="text-teal-400" />}
                {activeTab === 'compose' && <PenSquare size={18} className="text-emerald-400" />}
                {activeTab === 'contacts' && <Users size={18} className="text-cyan-400" />}
                {activeTab === 'archive' && <ArchiveIcon size={18} className="text-slate-400" />}
                {activeTab === 'scheduled' && <Clock size={18} className="text-teal-400" />}
                {activeTab === 'snoozed' && <Calendar size={18} className="text-amber-400" />}
                <span>
                  {activeTab === 'contacts' ? 'Address Book' : activeTab}
                </span>
              </h2>
            )}
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            {!selectedMessage && activeTab !== 'compose' && (
              <div className="relative hidden sm:block">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search emails or handles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors w-48 lg:w-64"
                />
              </div>
            )}

            <button
              onClick={() => {
                if (activeTab === 'inbox') loadInbox();
                if (activeTab === 'sent') loadSentMessages();
                if (activeTab === 'contacts') loadContacts();
                if (activeTab === 'scheduled') loadScheduled();
              }}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 transition-colors border border-white/5"
              title="Refresh"
            >
              <RefreshCw size={15} className={loadingMessages || loadingSent ? 'animate-spin text-emerald-400' : ''} />
            </button>
          </div>
        </header>

        {/* Dynamic Main Body View */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* ------------------------------------------------------------- */}
          {/* VIEW: Message Detail */}
          {/* ------------------------------------------------------------- */}
          {selectedMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-5"
            >
              {/* Header Box */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-white mb-1.5">
                      {selectedMessage.decryptedPayload?.subject || 'Decrypted Mailora Message'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>
                        From: <strong className="text-emerald-400">{selectedMessage.senderAlias ? `${selectedMessage.senderAlias}@mailora` : selectedMessage.sender}</strong>
                      </span>
                      <span>•</span>
                      <span>{new Date(selectedMessage.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Snooze Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSnoozeMenu(!showSnoozeMenu)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium transition-colors border border-white/5 flex items-center gap-1.5"
                      >
                        <Clock size={14} className="text-amber-400" />
                        Snooze
                      </button>

                      {showSnoozeMenu && (
                        <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0c121d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 z-30">
                          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-white/5">
                            Snooze Until
                          </div>
                          <button
                            onClick={() => handleSnooze(selectedMessage.contentCID, 1)}
                            className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors flex items-center gap-2"
                          >
                            <Clock size={12} /> Later Today (1 hr)
                          </button>
                          <button
                            onClick={() => handleSnooze(selectedMessage.contentCID, 24)}
                            className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors flex items-center gap-2"
                          >
                            <Calendar size={12} /> Tomorrow (24 hrs)
                          </button>
                          <button
                            onClick={() => handleSnooze(selectedMessage.contentCID, 168)}
                            className="w-full px-3.5 py-2 text-left text-xs text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors flex items-center gap-2"
                          >
                            <Calendar size={12} /> Next Week (7 days)
                          </button>
                        </div>
                      )}
                    </div>

                    {archivedCids.includes(selectedMessage.contentCID) ? (
                      <button
                        onClick={() => handleUnarchive(selectedMessage.contentCID)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium transition-colors border border-white/5"
                      >
                        Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(selectedMessage.contentCID)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium transition-colors border border-white/5"
                      >
                        Archive
                      </button>
                    )}

                    <button
                      onClick={() => handleReplyTo(selectedMessage.senderAlias ? `${selectedMessage.senderAlias}@mailora` : selectedMessage.sender)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Reply size={14} /> Reply
                    </button>
                  </div>
                </div>

                {/* Sender Address Pill & Explorer Link */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
                  <span className="text-slate-500">Sender Address:</span>
                  <a
                    href={getExplorerAddressUrl(selectedMessage.sender)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5"
                  >
                    {selectedMessage.sender}
                    <ExternalLink size={12} />
                  </a>

                  {selectedMessage.decryptedPayload?.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                      <BadgeCheck size={13} />
                      Verified Cryptographic Signature
                    </span>
                  )}
                </div>
              </div>

              {/* Feature 1: BOT Payment Notification Card if exists */}
              {selectedMessage.decryptedPayload?.payment && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Coins size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-amber-300">
                          +{selectedMessage.decryptedPayload.payment.amount} {selectedMessage.decryptedPayload.payment.symbol || 'BOT'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                          Direct On-Chain Transfer
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Native tokens transferred directly to your BotChain address with this message.
                      </p>
                    </div>
                  </div>

                  {selectedMessage.decryptedPayload.payment.txHash && (
                    <a
                      href={getExplorerTxUrl(selectedMessage.decryptedPayload.payment.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-500/30 shrink-0"
                    >
                      <span>View on Explorer</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              )}

              {/* AI Security Inspection Shield */}
              <AISecurityBanner
                subject={selectedMessage.decryptedPayload?.subject || ''}
                body={selectedMessage.decryptedPayload?.text || ''}
                senderAddress={selectedMessage.sender}
                senderAlias={selectedMessage.senderAlias || undefined}
              />

              {/* AI 1-Click Executive Summary Card */}
              <AISummaryCard
                subject={selectedMessage.decryptedPayload?.subject || ''}
                body={selectedMessage.decryptedPayload?.text || ''}
                sender={selectedMessage.senderAlias ? `${selectedMessage.senderAlias}@mailora` : selectedMessage.sender}
              />

              {/* Decrypted Message Body */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
                <div 
                  className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.decryptedPayload?.text || '<p>No content available</p>' }}
                />

                {/* Attachment Link if any */}
                {selectedMessage.decryptedPayload?.attachmentCID && (
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Paperclip size={14} className="text-emerald-400" />
                      <span>Encrypted Attachment Attached</span>
                    </div>
                    <a
                      href={`https://ipfs.io/ipfs/${selectedMessage.decryptedPayload.attachmentCID}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-1.5 transition-colors border border-white/5"
                    >
                      <Download size={13} />
                      Download IPFS File
                    </a>
                  </div>
                )}
              </div>

              {/* AI Smart Quick Replies */}
              <AISmartReplies
                subject={selectedMessage.decryptedPayload?.subject || ''}
                body={selectedMessage.decryptedPayload?.text || ''}
                sender={selectedMessage.senderAlias ? `${selectedMessage.senderAlias}@mailora` : selectedMessage.sender}
                onSelectReply={(replyText) => {
                  handleReplyTo(
                    selectedMessage.senderAlias ? `${selectedMessage.senderAlias}@mailora` : selectedMessage.sender,
                    replyText
                  )
                }}
              />
            </motion.div>
          ) : null}

          {/* ------------------------------------------------------------- */}
          {/* VIEW: Inbox */}
          {/* ------------------------------------------------------------- */}
          {!selectedMessage && activeTab === 'inbox' && (
            <div className="max-w-5xl mx-auto space-y-3">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span className="text-xs">Decrypting Mailora messages from BotChain...</span>
                </div>
              ) : inboxList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center p-8 rounded-3xl bg-slate-900/20 border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-500 mb-3">
                    <Inbox size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1">Your Inbox is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Share your decentralized handle <span className="text-emerald-400 font-mono">{myAlias ? `${myAlias}@mailora` : ''}</span> to receive end-to-end encrypted messages.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inboxList.map((msg, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedMessage(msg)}
                      className="p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-emerald-500/30 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Mail size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-xs text-white truncate">
                              {msg.senderAlias ? `${msg.senderAlias}@mailora` : `${msg.sender?.slice(0, 6)}...${msg.sender?.slice(-4)}`}
                            </span>
                            {msg.decryptedPayload?.payment && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center gap-1">
                                <Coins size={10} /> +{msg.decryptedPayload.payment.amount} BOT
                              </span>
                            )}
                            {msg.decryptedPayload?.isVerified && (
                              <BadgeCheck size={14} className="text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {msg.decryptedPayload?.subject || msg.decryptedPayload?.text?.replace(/<[^>]*>?/gm, '') || 'Encrypted content'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
                        {msg.decryptedPayload?.attachmentCID && (
                          <Paperclip size={14} className="text-slate-400" />
                        )}
                        <span>{new Date(msg.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW: Sent */}
          {/* ------------------------------------------------------------- */}
          {!selectedMessage && activeTab === 'sent' && (
            <div className="max-w-5xl mx-auto space-y-3">
              {loadingSent ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
                  <span className="text-xs">Fetching dispatched messages...</span>
                </div>
              ) : sentList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center p-8 rounded-3xl bg-slate-900/20 border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-500 mb-3">
                    <Send size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1">No Sent Messages</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Messages you encrypt and dispatch on BotChain will be cataloged here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sentList.map((msg, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedMessage(msg)}
                      className="p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-teal-500/30 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                          <Send size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-xs text-white truncate">
                              To: {msg.recipientAlias ? `${msg.recipientAlias}@mailora` : `${msg.recipient?.slice(0, 6)}...${msg.recipient?.slice(-4)}`}
                            </span>
                            {msg.decryptedPayload?.payment && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold flex items-center gap-1">
                                <Coins size={10} /> +{msg.decryptedPayload.payment.amount} BOT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {msg.decryptedPayload?.subject || msg.decryptedPayload?.text?.replace(/<[^>]*>?/gm, '') || 'Encrypted content'}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 shrink-0">
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW: Scheduled Messages */}
          {/* ------------------------------------------------------------- */}
          {!selectedMessage && activeTab === 'scheduled' && (
            <div className="max-w-5xl mx-auto space-y-3">
              {loadingScheduled ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
                  <span className="text-xs">Fetching scheduled messages...</span>
                </div>
              ) : scheduledList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center p-8 rounded-3xl bg-slate-900/20 border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-500 mb-3">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1">No Scheduled Messages</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Schedule messages in the composer to have them automatically dispatched on BotChain at a specific time.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
                          <Clock size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-xs text-white truncate">
                              To: {item.recipients.join(', ')}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono font-medium">
                              Send at: {new Date(item.sendAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {item.subject || item.content.replace(/<[^>]*>?/gm, '')}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteScheduled(item._id)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW: Snoozed */}
          {/* ------------------------------------------------------------- */}
          {!selectedMessage && activeTab === 'snoozed' && (
            <div className="max-w-5xl mx-auto space-y-3">
              {snoozedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center p-8 rounded-3xl bg-slate-900/20 border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-500 mb-3">
                    <Calendar size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1">No Snoozed Messages</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Snooze emails to temporarily hide them from your inbox until you are ready to reply.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {snoozedList.map((msg, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-between gap-4"
                    >
                      <div 
                        onClick={() => setSelectedMessage(msg)}
                        className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                          <Calendar size={15} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-white truncate block">
                            {msg.senderAlias ? `${msg.senderAlias}@mailora` : msg.sender}
                          </span>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {msg.decryptedPayload?.subject || msg.decryptedPayload?.text?.replace(/<[^>]*>?/gm, '') || 'Encrypted content'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleUnsnooze(msg.contentCID)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors"
                      >
                        Return to Inbox
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW: Archive */}
          {/* ------------------------------------------------------------- */}
          {!selectedMessage && activeTab === 'archive' && (
            <div className="max-w-5xl mx-auto space-y-3">
              {archiveList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center p-8 rounded-3xl bg-slate-900/20 border border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-slate-500 mb-3">
                    <ArchiveIcon size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-300 mb-1">Archive is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    You can archive messages from your inbox to keep your workspace organized.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {archiveList.map((msg, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedMessage(msg)}
                      className="p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-slate-500/30 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400 shrink-0">
                          <ArchiveIcon size={15} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-white truncate block">
                            {msg.senderAlias ? `${msg.senderAlias}@mailora` : msg.sender}
                          </span>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {msg.decryptedPayload?.subject || msg.decryptedPayload?.text?.replace(/<[^>]*>?/gm, '') || 'Encrypted content'}
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 shrink-0">
                        {new Date(msg.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW: Address Book (Contacts) */}
          {/* ------------------------------------------------------------- */}
          {!selectedMessage && activeTab === 'contacts' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Add Contact Form */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <UserPlus size={16} className="text-emerald-400" />
                  Add New Contact
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Add contacts using their BotChain `@mailora` alias to maintain a private encrypted address book.
                </p>

                <div className="flex gap-2">
                  <div className="flex-1 flex items-stretch rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-emerald-500 overflow-hidden transition-colors">
                    <input
                      type="text"
                      placeholder="vitalik"
                      value={newContactAlias.replace('@mailora', '')}
                      onChange={(e) => setNewContactAlias(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono min-w-0"
                    />
                    <div className="flex items-center px-3.5 bg-emerald-500/10 border-l border-white/10 text-xs font-mono font-bold text-emerald-400 select-none shrink-0">
                      @mailora
                    </div>
                  </div>
                  <button
                    onClick={handleAddContact}
                    disabled={isAddingContact || !newContactAlias}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAddingContact ? <Loader2 size={14} className="animate-spin" /> : 'Save Contact'}
                  </button>
                </div>
              </div>

              {/* Contacts List */}
              <div className="space-y-2">
                {contacts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No contacts saved yet.
                  </div>
                ) : (
                  contacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          {contact.alias[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-white block">
                            {contact.alias}@mailora
                          </span>
                          <span className="text-[11px] text-emerald-400/80 flex items-center gap-1 font-medium">
                            <BadgeCheck size={12} className="text-emerald-400" />
                            Verified Mailora Contact
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            addRecipient(`${contact.alias}@mailora`)
                            setActiveTab('compose')
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-colors"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.alias)}
                          className="p-1.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW: Compose (with AI Smart Compose & New Features) */}
          {/* ------------------------------------------------------------- */}
          {!selectedMessage && activeTab === 'compose' && (
            <div className="max-w-4xl mx-auto space-y-4">
              
              {/* AI Assistant Drawer / Trigger */}
              <AIComposeAssistant
                currentSubject={messageSubject}
                currentBody={messageContent}
                recipient={recipients.join(', ') || recipientInput}
                onApply={(subj, body) => {
                  if (subj) setMessageSubject(subj);
                  if (body) setMessageContent(body);
                }}
              />

              {/* Compose Card */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
                {/* Multi-Recipient Chip Input Field */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      Recipients (Send to One or Multiple)
                    </label>
                    {recipients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRecipients([])}
                        className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                      >
                        Clear all ({recipients.length})
                      </button>
                    )}
                  </div>

                  {/* Gmail-Style Tag / Chip Container */}
                  <div className="min-h-[48px] p-2 rounded-2xl border border-white/10 bg-white/[0.03] focus-within:border-emerald-500 transition-colors flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 px-1.5 select-none shrink-0">
                      To:
                    </span>

                    {/* Selected Recipient Chips */}
                    {recipients.map((rec, idx) => {
                      const cleanHandle = rec.replace('@mailora', '').replace('@cmail.com', '');
                      const initial = (cleanHandle[0] || 'M').toUpperCase();
                      const avatarGradients = [
                        'from-emerald-500 to-teal-400 text-slate-950',
                        'from-blue-500 to-indigo-500 text-white',
                        'from-purple-500 to-pink-500 text-white',
                        'from-amber-500 to-orange-500 text-slate-950',
                        'from-cyan-500 to-emerald-400 text-slate-950'
                      ];
                      const gradientClass = avatarGradients[idx % avatarGradients.length];

                      return (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-[#121c2c] border border-emerald-500/30 text-xs text-white shadow-sm hover:border-emerald-400/70 transition-all group"
                        >
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${gradientClass} font-bold text-[10px] flex items-center justify-center shrink-0 shadow-inner`}>
                            {initial}
                          </div>
                          <span className="font-mono text-xs text-slate-200">
                            {rec}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRecipient(idx)}
                            className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-full p-0.5 transition-colors ml-0.5"
                            title={`Remove ${rec}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}

                    {/* Inline Input for typing handles */}
                    <input
                      type="text"
                      placeholder={recipients.length === 0 ? "Type username (e.g. satoshi, vitalik) or web2 email..." : "Add another recipient..."}
                      value={recipientInput}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                      onChange={(e) => {
                        setRecipientInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={handleRecipientKeyDown}
                      className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none font-mono min-w-[170px]"
                    />
                  </div>

                  {/* Gmail-Style Autocomplete Suggestion Dropdown */}
                  {(() => {
                    const recipientQuery = recipientInput.replace('@mailora', '').replace('@cmail.com', '').toLowerCase().trim();
                    const allKnownContacts = [
                      ...contacts.map((c) => ({
                        alias: c.alias,
                        label: `${c.alias}@mailora`,
                        source: 'Address Book'
                      })),
                      ...messages
                        .filter((m) => m.senderAlias)
                        .map((m) => ({
                          alias: m.senderAlias,
                          label: `${m.senderAlias}@mailora`,
                          source: 'Recent Senders'
                        })),
                      ...sentMessages
                        .filter((m) => m.recipientAlias)
                        .map((m) => ({
                          alias: m.recipientAlias,
                          label: `${m.recipientAlias}@mailora`,
                          source: 'Recent Sent'
                        }))
                    ].filter((item, index, self) =>
                      index === self.findIndex((t) => (t.alias || '').toLowerCase() === (item.alias || '').toLowerCase())
                    );

                    const filteredSuggestions = allKnownContacts.filter((c) =>
                      !recipientQuery ||
                      (c.alias && c.alias.toLowerCase().includes(recipientQuery))
                    ).slice(0, 5);

                    if (!showSuggestions) return null;

                    return (
                      <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-[#0c121d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1.5 backdrop-blur-2xl">
                        <div className="px-3.5 py-1.5 text-[10px] uppercase tracking-wider font-bold text-slate-500 border-b border-white/5 flex items-center justify-between">
                          <span>Suggested Recipients</span>
                          <span className="text-[9px] font-mono text-emerald-400">Mailora Directory</span>
                        </div>

                        {/* Top quick-add typed option if user entered something */}
                        {recipientQuery && (
                          <div
                            onMouseDown={() => {
                              addRecipient(recipientInput);
                            }}
                            className="w-full px-3.5 py-2.5 flex items-center gap-3 hover:bg-emerald-500/10 transition-colors text-left cursor-pointer border-b border-white/5"
                          >
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                              +
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-emerald-300 truncate">
                                Add &ldquo;{recipientInput.includes('@') ? recipientInput : `${recipientInput}@mailora`}&rdquo;
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Press Enter or click to add as recipient
                              </span>
                            </div>
                          </div>
                        )}

                        {filteredSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => {
                              addRecipient(item.alias.includes('@mailora') ? item.alias : `${item.alias}@mailora`);
                            }}
                            className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-emerald-500/10 transition-colors text-left cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                                {item.alias[0]?.toUpperCase() || 'M'}
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors block truncate">
                                  {item.alias.includes('@mailora') ? item.alias : `${item.alias}@mailora`}
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-medium shrink-0 ml-2">
                              {item.source}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Quick Contact Chips if available */}
                  {contacts.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap text-[11px] text-slate-500">
                      <span className="font-medium text-slate-400">Quick add:</span>
                      {contacts.slice(0, 5).map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => addRecipient(`${c.alias}@mailora`)}
                          className="px-2 py-0.5 rounded-lg bg-white/[0.03] hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-300 border border-white/5 transition-colors font-mono flex items-center gap-1"
                        >
                          <span>+</span>
                          <span>{c.alias}@mailora</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subject Field */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    placeholder="Enter a descriptive subject..."
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                    Encrypted Message Body
                  </label>
                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <ReactQuill
                      theme="snow"
                      value={messageContent}
                      onChange={setMessageContent}
                      placeholder="Write your private message here (or generate it using the AI Composer above)..."
                    />
                  </div>
                </div>

                {/* Feature 1: BOT Payment Attachment Box */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins size={16} className="text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Attach Botcoin (`BOT`) Payment</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {balanceData ? `${Number(balanceData.formatted).toFixed(3)} ${balanceData.symbol}` : '0 BOT'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachPayment(!attachPayment)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors border ${
                        attachPayment
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {attachPayment ? 'Attached' : '+ Attach Payment'}
                    </button>
                  </div>

                  {attachPayment && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.05"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full bg-black/40 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono pr-14"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-amber-400">
                          BOT
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {['0.01', '0.1', '0.5', '1.0'].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setPaymentAmount(amt)}
                            className="px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 text-[11px] font-mono border border-white/5 transition-colors"
                          >
                            {amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attachment Picker */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2">
                    <Paperclip size={16} className="text-emerald-400" />
                    <span className="text-xs text-slate-300">
                      {attachmentFile ? attachmentFile.name : 'Attach file (Max 5MB)'}
                    </span>
                  </div>
                  <label className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer transition-colors border border-white/5">
                    Browse File
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachmentFile(e.target.files[0])
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Feature 4: Gasless Relayer Mode Toggle */}
                    <button
                      type="button"
                      onClick={() => setIsGaslessMode(!isGaslessMode)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isGaslessMode
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Relayer sponsors BotChain transaction gas fees"
                    >
                      <Zap size={14} className={isGaslessMode ? 'text-emerald-400 fill-emerald-400' : ''} />
                      <span>Gasless Relayer: {isGaslessMode ? 'ON' : 'OFF'}</span>
                    </button>

                    <span className="text-[11px] text-slate-500 hidden md:flex items-center gap-1">
                      <Lock size={12} className="text-emerald-400" />
                      E2E Encrypted
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Feature 5: Schedule Send Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowSchedulePicker(!showSchedulePicker)}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors flex items-center gap-1"
                        title="Schedule for future delivery"
                      >
                        <Clock size={16} className="text-teal-400" />
                        <ChevronDown size={14} />
                      </button>

                      {showSchedulePicker && (
                        <div className="absolute right-0 bottom-full mb-2 w-60 bg-[#0c121d] border border-white/10 rounded-2xl shadow-2xl p-3 z-30 space-y-2 backdrop-blur-2xl">
                          <div className="text-[11px] font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-2">
                            <Clock size={13} className="text-teal-400" />
                            Schedule Dispatch
                          </div>
                          <button
                            type="button"
                            onClick={() => handleScheduleSend(1)}
                            className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-teal-500/10 text-xs text-slate-300 hover:text-teal-300 transition-colors"
                          >
                            In 1 Hour
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScheduleSend(24)}
                            className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-teal-500/10 text-xs text-slate-300 hover:text-teal-300 transition-colors"
                          >
                            Tomorrow (24 hrs)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScheduleSend(72)}
                            className="w-full text-left px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-teal-500/10 text-xs text-slate-300 hover:text-teal-300 transition-colors"
                          >
                            In 3 Days (72 hrs)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Primary Send Button */}
                    <button
                      onClick={handleSend}
                      disabled={isSending || (recipients.length === 0 && !recipientInput.trim()) || !messageContent}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex-1 sm:flex-none justify-center"
                    >
                      {isSending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          {attachPayment ? 'Processing Payment...' : 'Encrypting & Dispatching...'}
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          {attachPayment && Number(paymentAmount) > 0
                            ? `Send with ${paymentAmount} BOT`
                            : recipients.length > 1 
                              ? `Encrypt & Send to (${recipients.length}) on BotChain`
                              : 'Encrypt & Send on BotChain'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MANDATORY ONBOARDING & ALIAS REGISTRATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {!loadingAlias && !myAlias && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-[#0c121d] border border-emerald-500/30 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg shadow-emerald-500/20 border border-emerald-500/30 ring-2 ring-emerald-500/20 shrink-0">
                <img src="/logo.png" alt="Mailora Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 mb-1">
                  <Sparkles size={11} /> Required Setup
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Claim Your Mailora Identity
                </h2>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <p>
                To enable zero-knowledge message routing and end-to-end encryption on <strong className="text-emerald-400">BOT Chain</strong>, every user must register a unique decentralized handle.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                <span>Permanent on-chain handle mapped to <span className="font-mono text-slate-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span></span>
              </div>
            </div>

            {/* Alias Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                Choose Your Username / Handle
              </label>

              <div className="relative">
                <input
                  type="text"
                  placeholder="satoshi"
                  value={registerInput}
                  onChange={(e) => setRegisterInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="w-full bg-black/50 border border-emerald-500/40 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono pr-28"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-mono font-bold">
                  @mailora
                </span>
              </div>

              {/* Real-time Status Indicator */}
              <div className="flex items-center justify-between text-xs px-1">
                {isChecking ? (
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin text-emerald-400" />
                    Checking availability on BotChain...
                  </span>
                ) : isAvailable === true ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={13} />
                    {registerInput}@mailora is available!
                  </span>
                ) : isAvailable === false ? (
                  <span className="text-rose-400 flex items-center gap-1 font-semibold">
                    <XCircle size={13} />
                    Alias already taken on BotChain. Try another name.
                  </span>
                ) : (
                  <span className="text-slate-500 text-[11px]">
                    Min 3 characters. Lowercase letters, numbers, hyphens only.
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleRegister(false)}
                disabled={isRegistering || isAvailable !== true || !registerInput}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:opacity-95 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Confirming on BotChain...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    Register Handle on BotChain
                  </>
                )}
              </button>

              <button
                onClick={() => handleRegister(true)}
                disabled={isRegistering || isAvailable !== true || !registerInput}
                className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-500/20 disabled:opacity-40"
              >
                <Zap size={14} className="text-emerald-400" />
                ⚡ Gasless Sponsored Registration (0 Gas)
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Wrong wallet?</span>
                <button
                  onClick={() => disconnect()}
                  className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5"
                >
                  <LogOut size={13} /> Disconnect
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings size={18} className="text-emerald-400" />
                Mailora Preferences & Notifications
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Email notification setting */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <label className="text-xs font-semibold text-slate-200 block flex items-center gap-2">
                <Mail size={14} className="text-emerald-400" />
                Web2 Email Notification Bridge
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Receive private email alerts whenever someone sends an encrypted Web3 message to your BotChain address.
              </p>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={emailPref}
                onChange={(e) => setEmailPref(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Feature 7: Telegram Notifications Setting */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                  <Bell size={14} className="text-teal-400" />
                  Telegram Instant Alert Bot
                </label>
                <a
                  href="https://t.me/MailoraAlertsBot"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-teal-400 hover:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 font-medium"
                >
                  @MailoraAlertsBot ↗
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Receive instant Telegram push alerts when your @mailora alias receives messages. Start <a href="https://t.me/MailoraAlertsBot" target="_blank" rel="noreferrer" className="text-teal-400 underline">@MailoraAlertsBot</a> and enter your Chat ID below.
              </p>
              <input
                type="text"
                placeholder="Telegram Chat ID (e.g. 123456789)"
                value={telegramPref}
                onChange={(e) => setTelegramPref(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>

            {/* Network Info */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Active Network:</span>
                <span className="font-semibold text-emerald-400">BOT Chain (Mainnet)</span>
              </div>
              <div className="flex justify-between">
                <span>Chain ID:</span>
                <span className="font-mono text-slate-300">677</span>
              </div>
              <div className="flex justify-between">
                <span>RPC URL:</span>
                <span className="font-mono text-slate-300">https://rpc.botchain.ai</span>
              </div>
              <div className="flex justify-between">
                <span>Explorer:</span>
                <a
                  href="https://scan.botchain.ai"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  scan.botchain.ai <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                disabled={isSavingSettings}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                {isSavingSettings ? <Loader2 size={14} className="animate-spin" /> : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}