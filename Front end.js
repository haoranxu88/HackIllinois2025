{\rtf1\ansi\ansicpg1252\cocoartf2821
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import \{ useState \} from "react";\
import \{ Button \} from "@/components/ui/button";\
import \{ Input \} from "@/components/ui/input";\
import \{ Textarea \} from "@/components/ui/textarea";\
import \{ Card, CardContent \} from "@/components/ui/card";\
import \{ Mic, Image as ImageIcon \} from "lucide-react";\
\
export default function InputComponent() \{\
  const [text, setText] = useState("");\
  const [image, setImage] = useState(null);\
  const [isRecording, setIsRecording] = useState(false);\
  let mediaRecorder;\
\
  const handleImageUpload = (event) => \{\
    const file = event.target.files[0];\
    if (file) \{\
      setImage(URL.createObjectURL(file));\
    \}\
  \};\
\
  const handleAudioRecord = async () => \{\
    if (!isRecording) \{\
      try \{\
        const stream = await navigator.mediaDevices.getUserMedia(\{ audio: true \});\
        mediaRecorder = new MediaRecorder(stream);\
        mediaRecorder.start();\
        setIsRecording(true);\
        mediaRecorder.onstop = () => \{\
          setIsRecording(false);\
        \};\
      \} catch (error) \{\
        console.error("Error accessing microphone:", error);\
      \}\
    \} else \{\
      mediaRecorder.stop();\
      setIsRecording(false);\
    \}\
  \};\
\
  return (\
    <Card className="p-4 max-w-lg mx-auto space-y-4">\
      <CardContent>\
        <Textarea\
          placeholder="Enter text here..."\
          value=\{text\}\
          onChange=\{(e) => setText(e.target.value)\}\
          className="w-full border rounded-md p-2"\
        />\
        <div className="flex gap-4 mt-4">\
          <label className="cursor-pointer">\
            <ImageIcon className="h-6 w-6" />\
            <Input type="file" accept="image/*" onChange=\{handleImageUpload\} className="hidden" />\
          </label>\
          <Button onClick=\{handleAudioRecord\} variant="outline">\
            <Mic className=\{`h-6 w-6 $\{isRecording ? "text-red-500" : ""\}`\} />\
          </Button>\
        </div>\
        \{image && <img src=\{image\} alt="Uploaded" className="mt-4 rounded-lg" />\}\
      </CardContent>\
    </Card>\
  );\
\}\
}