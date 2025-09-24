const fs = require('fs');

// Function to convert image to base64
function imageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    return base64String;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

// Function to get image MIME type
function getImageMimeType(imagePath) {
  const extension = imagePath.toLowerCase().split('.').pop();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

// FULL AI VISION - Analyzes both image content and text
async function validateIssue(description, imageUrl, imagePath = null) {
  try {
    console.log("🤖 Starting FULL AI VISION validation...");
    console.log("Description:", description);
    console.log("Image path:", imagePath);

    // Try to use full AI vision first
    if (process.env.GEMINI_API_KEY) {
      try {
        return await performFullAIVision(description, imagePath);
      } catch (aiError) {
        console.error("AI Vision failed, falling back to enhanced analysis:", aiError.message);
        return await performEnhancedValidation(description, imagePath);
      }
    } else {
      console.log("No Gemini API key found, using enhanced validation");
      return await performEnhancedValidation(description, imagePath);
    }
    
  } catch (error) {
    console.error("Validation error:", error.message);
    return fallbackValidation(description);
  }
}

// FULL AI VISION - Actually sees and analyzes image content
async function performFullAIVision(description, imagePath) {
  console.log("🔍 Performing FULL AI VISION analysis...");
  
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
🔍 CIVIC ISSUE VISUAL ANALYSIS TASK:

You are an expert civic infrastructure analyst. Analyze this image and text description to validate a civic issue report.

USER'S DESCRIPTION: "${description}"

ANALYSIS REQUIREMENTS:
1. 👁️ VISUAL INSPECTION: Carefully examine what you see in the image
2. 🔍 CONTENT MATCHING: Does the description match what's actually in the image?
3. 🏗️ ISSUE VALIDATION: Is this a legitimate civic infrastructure problem?
4. 📊 SEVERITY ASSESSMENT: How urgent is this issue?
5. 🏷️ CATEGORY CLASSIFICATION: What type of civic issue is this?

RETURN EXACTLY THIS JSON FORMAT:
{
  "match": true,
  "confidence": 0.95,
  "suggested_description": "Detailed description of what you actually see in the image",
  "image_analysis": "Detailed description of the civic issue visible in the image",
  "severity": "high",
  "category_suggestion": "Road",
  "visual_details": "Specific details you observe (colors, size, location, damage extent)",
  "authenticity_check": "Assessment of whether this appears to be a real civic issue photo",
  "improvement_suggestions": "What should be done to fix this issue"
}

GUIDELINES:
- match: true only if description reasonably matches what you see
- confidence: 0.0-1.0 based on image clarity and description accuracy
- severity: "low" (minor), "medium" (needs attention), "high" (urgent/dangerous)
- category_suggestion: "Road", "Sanitation", "Electricity", "Water", or "Other"
- Be specific about what you actually observe in the image
- Flag any suspicious or non-civic issues
`;

    let parts = [{ text: prompt }];

    // Add the actual image for AI to analyze
    if (imagePath && fs.existsSync(imagePath)) {
      console.log("📸 Adding image to AI analysis:", imagePath);
      const base64Data = imageToBase64(imagePath);
      if (base64Data) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: getImageMimeType(imagePath)
          }
        });
        console.log("✅ Image successfully added to AI analysis");
      } else {
        console.log("❌ Failed to convert image to base64");
      }
    } else {
      console.log("⚠️ No image file found, performing text-only analysis");
    }

    console.log("🚀 Sending request to Gemini AI...");
    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();
    
    console.log("🤖 GEMINI AI VISION RESPONSE:");
    console.log(text);
    
    // Parse AI response
    try {
      // Clean up the response text (remove markdown formatting if present)
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);
      
      return {
        ...parsed,
        validation_method: "gemini_ai_full_vision",
        ai_model: "gemini-1.5-flash",
        analysis_timestamp: new Date().toISOString()
      };
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError.message);
      console.log("Raw AI response:", text);
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            validation_method: "gemini_ai_full_vision_recovered",
            ai_model: "gemini-1.5-flash"
          };
        } catch (e) {
          console.log("Could not recover JSON from AI response");
        }
      }
      
      // Fallback with AI text analysis
      return {
        match: true,
        confidence: 0.7,
        suggested_description: description,
        image_analysis: text.substring(0, 200) + "...",
        severity: "medium",
        category_suggestion: "Other",
        validation_method: "gemini_ai_text_fallback",
        raw_ai_response: text
      };
    }
    
  } catch (error) {
    console.error("🚨 Full AI Vision error:", error.message);
    throw error; // Re-throw to trigger fallback
  }
}

// Enhanced text-based validation (fallback)
async function performEnhancedValidation(description, imagePath) {
  console.log("🔧 Performing enhanced validation (fallback)...");
  
  const textAnalysis = analyzeDescription(description);
  
  let imageAnalysis = "No image analysis available";
  let imageConfidence = 0.5;
  
  if (imagePath && fs.existsSync(imagePath)) {
    try {
      const stats = fs.statSync(imagePath);
      const fileSize = stats.size;
      const fileName = imagePath.toLowerCase();
      
      if (fileSize > 100000) {
        imageConfidence += 0.2;
        imageAnalysis = "Large image file detected, likely contains detailed visual information";
      }
      
      if (fileName.includes('whatsapp') || fileName.includes('photo')) {
        imageConfidence += 0.1;
        imageAnalysis += ". Image appears to be from mobile device, suggesting real-world capture";
      }
      
      imageAnalysis += `. File size: ${Math.round(fileSize/1024)}KB`;
      
    } catch (error) {
      console.log("Could not analyze image file:", error.message);
    }
  }
  
  const combinedConfidence = Math.min(0.95, (textAnalysis.confidence + imageConfidence) / 2);
  
  return {
    match: textAnalysis.match,
    confidence: combinedConfidence,
    suggested_description: textAnalysis.suggested_description,
    image_analysis: imageAnalysis,
    severity: textAnalysis.severity,
    category_suggestion: textAnalysis.category,
    validation_method: "enhanced_text_analysis"
  };
}

// Text analysis helper
function analyzeDescription(description) {
  const isValidLength = description && description.length >= 10 && description.length <= 1000;
  
  const roadKeywords = /\b(pothole|road|street|pavement|asphalt|traffic|vehicle|car|bike|pedestrian|crossing|crack|bump)\b/i;
  const sanitationKeywords = /\b(garbage|trash|waste|dump|dirty|smell|overflow|bin|litter|sewage|toilet|clean)\b/i;
  const electricityKeywords = /\b(light|lamp|power|electric|wire|pole|dark|bulb|street.*light|signal|outage)\b/i;
  const waterKeywords = /\b(water|pipe|leak|flood|drain|burst|flow|wet|puddle|overflow|tap|supply)\b/i;
  const generalKeywords = /\b(broken|damaged|issue|problem|repair|fix|crack|hole|unsafe|danger|maintenance)\b/i;
  
  let category = "Other";
  let severity = "medium";
  let confidence = 0.5;
  
  if (roadKeywords.test(description)) {
    category = "Road";
    confidence += 0.2;
    if (/\b(pothole|crack|dangerous|accident|deep|large)\b/i.test(description)) severity = "high";
  } else if (sanitationKeywords.test(description)) {
    category = "Sanitation";
    confidence += 0.2;
    if (/\b(overflow|smell|health|disease|blocked)\b/i.test(description)) severity = "high";
  } else if (electricityKeywords.test(description)) {
    category = "Electricity";
    confidence += 0.2;
    if (/\b(dark|unsafe|night|security|outage)\b/i.test(description)) severity = "high";
  } else if (waterKeywords.test(description)) {
    category = "Water";
    confidence += 0.2;
    if (/\b(flood|burst|emergency|contaminated)\b/i.test(description)) severity = "high";
  }
  
  if (generalKeywords.test(description)) {
    confidence += 0.1;
  }
  
  if (description.length > 50) confidence += 0.1;
  if (description.length > 100) confidence += 0.1;
  
  const match = isValidLength && confidence > 0.6;
  
  return {
    match,
    confidence: Math.min(0.9, confidence),
    suggested_description: description,
    severity,
    category
  };
}

// Simple fallback validation
function fallbackValidation(description) {
  const isValidLength = description && description.length >= 10 && description.length <= 1000;
  
  return {
    match: isValidLength,
    confidence: 0.5,
    suggested_description: description,
    image_analysis: "Validation system unavailable",
    severity: "medium",
    category_suggestion: "Other",
    validation_method: "fallback"
  };
}

module.exports = {
  validateIssue
};
