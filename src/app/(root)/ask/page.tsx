import TextType from "@/components/TextType";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp } from "lucide-react";

const AskPage = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-center w-full mb-6">Legal Ask</h1>
      <div className="min-h-[65vh]">
        <TextType
          text={[
            "กรรมการบริษัทจำกัดมีหน้าที่อะไรบ้าง",
            "เปรียบเทียบหน้าที่และความรับผิดของกรรมการ ระหว่างบริษัทจำกัดกับบริษัทมหาชนจำกัด",
            "กรรมการพ้นจากตำแหน่งได้ในกรณีใดบ้าง",
            "อำนาจกรรมการในการแทนบริษัทมีขอบเขตอย่างไร",
          ]}
          typingSpeed={75}
          className="text-primary/70"
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex gap-2">
            <Input placeholder="Ask a legal question..." className="flex-1" />
            <Button size="icon" className="shrink-0">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskPage;
