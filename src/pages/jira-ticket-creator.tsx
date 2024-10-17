import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, X, Copy } from 'lucide-react';
import ThemeToggle from '@/components/theme-toggle';

interface FormData {
  userStory: {
    as: string;
    want: string;
    so: string;
  };
  acceptanceCriteria: { type: string; content: string }[];
  definitionOfDone: string;
  description: string;
  notes: string;
}

const JiraTicketCreator = () => {
  const [activeTab, setActiveTab] = useState("user-story");
  const [formData, setFormData] = useState({
    userStory: {
      as: "",
      want: "",
      so: ""
    },
    acceptanceCriteria: [
      { type: "given", content: "" }
    ],
    definitionOfDone: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    const savedData = localStorage.getItem('jiraTicketData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof FormData,
    field?: string | null,
    index?: number
  ) => {
    const { value } = e.target;
    setFormData((prevData) => {
      if (section === 'acceptanceCriteria') {
        const newAcceptanceCriteria = [...prevData.acceptanceCriteria];
        newAcceptanceCriteria[index ?? -1] = {
          ...newAcceptanceCriteria[index ?? -1],
          content: value,
        };
        return { ...prevData, acceptanceCriteria: newAcceptanceCriteria };
      } else if (field) {
        if (typeof prevData[section] === 'object' && prevData[section] !== null) {
          return {
            ...prevData,
            [section]: { ...(prevData[section] as object), [field]: value },
          };
        } else {
          // Handle the case where prevData[section] is not an object
          return { ...prevData, [section]: { [field]: value } };
        }
      } else {
        return { ...prevData, [section]: value };
      }
    });
  };

  const addAcceptanceCriteria = (type: string) => {
    setFormData((prevData) => ({
      ...prevData,
      acceptanceCriteria: [...prevData.acceptanceCriteria, { type, content: "" }]
    }));
  };

  const removeAcceptanceCriteria = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      acceptanceCriteria: prevData.acceptanceCriteria.filter((_, i) => i !== index)
    }));
  };

  type FormDataKey = keyof typeof formData;

  const hasContent = (section: FormDataKey) => {
    if (section === 'userStory') {
      return Object.values(formData.userStory).some(val => val.trim() !== '');
    } else if (section === 'acceptanceCriteria') {
      return formData.acceptanceCriteria.some(criteria => criteria.content.trim() !== '');
    } else {
      return formData[section].trim() !== '';
    }
  };

  const defaultValues = [
    { // First set (Existing)
      userStory: {
        as: "a registered user",
        want: "to be able to reset my password",
        so: "that I can regain access to my account if I forget my password"
      },
      acceptanceCriteria: [
        { type: "given", content: "I have navigated to the password reset page" },
        { type: "when", content: "I enter my registered email address" },
        { type: "then", content: "I receive an email with a password reset link" }
      ],
      definitionOfDone: "- All acceptance criteria are met\n- Code has been reviewed\n- Unit tests are written and passing\n- Documentation is updated",
      description: "This feature will allow users to reset their passwords if they forget them.  The process will involve sending a reset link to the user's registered email address.",
      notes: "Consider adding security measures such as rate limiting to prevent abuse."
    },
    { // Second set (New)
      userStory: {
        as: "a new user",
        want: "to be able to create an account",
        so: "that I can use the application"
      },
      acceptanceCriteria: [
        { type: "given", content: "I am on the registration page" },
        { type: "when", content: "I fill in all the required fields with valid data" },
        { type: "and", content: "I click the 'Register' button" },
        { type: "then", content: "My account is created" },
        { type: "and", content: "I am logged in" }
      ],
      definitionOfDone: "- All acceptance criteria are met\n- User data is securely stored\n- Registration process is user-friendly",
      description: "This feature will allow new users to create accounts and start using the application. It should include validation for all required fields.",
      notes: "Consider adding support for social login in the future."
    },
    { // Third set (New)
      userStory: {
        as: "an administrator",
        want: "to be able to view user activity logs",
        so: "that I can monitor system usage and identify potential security issues"
      },
      acceptanceCriteria: [
        { type: "given", content: "I am logged in as an administrator" },
        { type: "when", content: "I navigate to the 'User Activity Logs' page" },
        { type: "then", content: "I can see a list of recent user activities" },
        { type: "and", content: "I can filter the logs by date, user, or activity type" }
      ],
      definitionOfDone: "- All acceptance criteria are met\n- Log data is accurate and complete\n- The interface is easy to navigate and use",
      description: "This feature will provide administrators with a view of user activity logs to help monitor system usage and identify potential security threats.",
      notes: "Ensure that sensitive information is not exposed in the logs."
    }
  ];
  

  const [currentDefaultIndex, setCurrentDefaultIndex] = useState(0);

  const handleAutofill = () => {
    setFormData(defaultValues[currentDefaultIndex]);

    // Cycle to the next set of defaults, wrapping around if necessary
    setCurrentDefaultIndex((prevIndex) => (prevIndex + 1) % defaultValues.length); 
  };

  const handleNext = () => {
    const tabs = ["user-story", "acceptance-criteria", "definition-of-done", "description", "notes"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const tabs = ["user-story", "acceptance-criteria", "definition-of-done", "description", "notes"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optionally provide feedback to the user that the copy was successful
      console.log("Copied to clipboard!");
    }, (err) => {
      console.error("Could not copy text: ", err);
    });
  };
  
  function isFormDataKey(key: string): key is keyof FormData {
    return ['userStory', 'acceptanceCriteria', 'definitionOfDone', 'description', 'notes'].includes(key);
  }  
  
  const formatStructuredContent = (section: FormDataKey) => {
    if (section === 'userStory') {
      return `As a ${formData.userStory.as}, I want ${formData.userStory.want} so that ${formData.userStory.so}.`;
    } else if (section === 'acceptanceCriteria') {
      return formData.acceptanceCriteria.map(criteria =>
        `${criteria.type.charAt(0).toUpperCase() + criteria.type.slice(1)} ${criteria.content}`
      ).join('\n');
    }
    return formData[section];
  };
  
  
  const copyAllContent = () => {
      const allContent = 
      `User Story:\n${formatStructuredContent('userStory')}\n\n` +
      `Acceptance Criteria:\n${formatStructuredContent('acceptanceCriteria')}\n\n` +
      `Definition of Done:\n${formatStructuredContent('definitionOfDone')}\n\n` +
      `Description:\n${formatStructuredContent('description')}\n\n` +
        `Notes:\n${formatStructuredContent('notes')}`;
  
    copyToClipboard(allContent);
  };

  const renderUserStoryFields = () => (
    <div className="space-y-4 text-left">
      {["as", "want", "so"].map((field) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={`userStory-${field}`}>
            {field === "as"
              ? "As an" // Change label for "as" field
              : field === "want"
              ? "I want" // Change label for "want" field
              : field === "so"
              ? "So that" // Change label for "so" field
              : ""}
          </Label>
          <Input
            id={`userStory-${field}`}
            name={`userStory-${field}`}
            value={formData.userStory[field as keyof typeof formData.userStory]}
            onChange={(e) => handleInputChange(e, "userStory", field as keyof typeof formData.userStory)}
            placeholder={`Enter ${field}...`}
          />
        </div>
      ))}
    </div>
  );


  const renderAcceptanceCriteriaFields = () => (
    <div className="space-y-4">
      {formData.acceptanceCriteria.map((criteria, index) => (
        <div key={index} className="flex items-center space-x-2">
          <select
            value={criteria.type}
            onChange={(e) => {
              const newType = e.target.value;
              setFormData((prevData) => {
                const newAcceptanceCriteria = [...prevData.acceptanceCriteria];
                newAcceptanceCriteria[index] = { ...newAcceptanceCriteria[index], type: newType };
                return { ...prevData, acceptanceCriteria: newAcceptanceCriteria };
              });
            }}
            className="border rounded p-2 bg-muted"
          >
            <option value="given">Given</option>
            <option value="when">When</option>
            <option value="then">Then</option>
            <option value="and">And</option>
          </select>
          <Input
            value={criteria.content}
            onChange={(e) => handleInputChange(e, 'acceptanceCriteria', null, index)}
            placeholder={`Enter ${criteria.type}...`}
            className="flex-grow"
          />
          <Button onClick={() => removeAcceptanceCriteria(index)} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <div className="flex space-x-2">
        <Button onClick={() => addAcceptanceCriteria('given')} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Given
        </Button>
        <Button onClick={() => addAcceptanceCriteria('when')} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add When
        </Button>
        <Button onClick={() => addAcceptanceCriteria('then')} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Then
        </Button>
        <Button onClick={() => addAcceptanceCriteria('and')} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add And
        </Button>
      </div>
    </div>
  );

//   const formatStructuredContent = (section) => {
//     if (section === 'userStory') {
//       return `As a ${formData.userStory.as}, I want ${formData.userStory.want} so that ${formData.userStory.so}.`;
//     } else if (section === 'acceptanceCriteria') {
//       return formData.acceptanceCriteria.map(criteria => 
//         `${criteria.type.charAt(0).toUpperCase() + criteria.type.slice(1)} ${criteria.content}`
//       ).join('\n');
//     }
//     return formData[section];
//   };

  const handleReset = () => {
    setFormData({
      userStory: {
        as: "",
        want: "",
        so: ""
      },
      acceptanceCriteria: [
        { type: "given", content: "" }
      ],
      definitionOfDone: "",
      description: "",
      notes: "",
    });
    localStorage.removeItem('jiraTicketData'); // Clear local storage
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
         
        <div className="flex justify-center items-center relative">
            <CardTitle className="text-center">Jira Ticket Helper</CardTitle>
            <div className="flex justify-end items-center absolute top-0 right-0">
              <a href="https://github.com/allenjustinblanco/jira-ticket-helper" target="_blank" rel="noopener noreferrer" className=' mr-2'>
                <Button variant="outline" size="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="sr-only">GitHub</span>
                </Button>
              </a>
              <ThemeToggle />
          </div>

        </div>

          <CardDescription>Fill in the details to create your Jira ticket information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="user-story">User Story</TabsTrigger>
              <TabsTrigger value="acceptance-criteria">Acceptance Criteria</TabsTrigger>
              <TabsTrigger value="definition-of-done">Definition of Done</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="user-story">
              {renderUserStoryFields()}
            </TabsContent>
            <TabsContent value="acceptance-criteria">
              {renderAcceptanceCriteriaFields()}
            </TabsContent>
            <TabsContent value="definition-of-done">
              <div className="space-y-2">
                <Label htmlFor="definitionOfDone">Definition of Done</Label>
                <Textarea
                  id="definitionOfDone"
                  name="definitionOfDone"
                  value={formData.definitionOfDone}
                  onChange={(e) => handleInputChange(e, 'definitionOfDone')}
                  placeholder="- All acceptance criteria are met
- Code has been reviewed
- Unit tests are written and passing
- Documentation is updated"
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
            <TabsContent value="description">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange(e, 'description')}
                  placeholder="Provide a detailed description of the ticket..."
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
            <TabsContent value="notes">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange(e, 'notes')}
                  placeholder="Any additional notes or considerations..."
                  className="min-h-[200px]"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
        <Button onClick={handlePrevious} disabled={activeTab === "user-story"}>Previous</Button>
        <div className="space-x-2"> 
          {/* <Button onClick={handleSave}>Save</Button> */}
          <Button onClick={handleAutofill}>Autofill</Button> {/* Autofill button */}
          <Button onClick={handleReset} variant="destructive">Reset</Button>
        </div>
        <Button onClick={handleNext} disabled={activeTab === "notes"}>Next</Button>

      </CardFooter>
      </Card>
      <Card className="mt-8 w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Generated Jira Ticket Information</CardTitle>
          <Button onClick={copyAllContent}><Copy className="h-4 w-4 mr-2" /> Copy All</Button> {/* Added Copy All button */}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          {Object.keys(formData).map((key) => {
            if (!isFormDataKey(key)) {
              return null; // Or handle the invalid key appropriately
            }
            return (
              hasContent(key) && ( // Conditionally render the section
                <div key={key} className="bg-muted p-4 rounded-md">
                  <h3 className="font-bold mb-2">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}</h3>
                  <p className="whitespace-pre-wrap">{formatStructuredContent(key)}</p>
                  <Button onClick={() => copyToClipboard(formatStructuredContent(key))} className="mt-2">Copy to Clipboard</Button>
                </div>
              )
            );
          })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JiraTicketCreator;