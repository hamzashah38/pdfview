import React from 'react'
import 'react-datepicker/dist/react-datepicker.css';
import Moment from 'moment'
import { connect } from 'react-redux'
import ReactHtmlParser from 'react-html-parser';
import { PulseLoader } from 'react-spinners';
import html2Canvas from 'html2canvas'
import jsPDF from 'jspdf';
import Axios from 'axios';
import {
    API_SINGLE_TEMPLATE,
    API_SAVE_PDFDESIGN,
    API_EDIT_PDFDESIGN,
    API_SINGLE_PDFDESIGN
} from '../../../config';
import { Row, Col, ModalBody } from 'react-bootstrap2';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { Modal } from 'react-bootstrap'



class SubmissionPDFView extends React.PureComponent {


    constructor(props) {
        super(props)
        this.state = {
            s_date: Moment(),
            downloadButtonState: 'disabled',
            reportDownloading: false,
            modalCustomClass: "",
            PDFStructure: [],
            tableGroupingList: [],
            imageIndex: 0,
            images: [],
            loader:true,
            generatingPDF: false,
            needMoreScaling: true,
            processDeficiencyTable: false,
            tempDivText: '',
            progress: '0%',
            showPages: false,
            pageList: []
        }
    }

    async componentDidMount() {

        // const { siteID } = this.props.match.params;

        let siteID = this.props.insID;
        let templateID = (this.props.submitFormData.name) || this.props.templateID;

        console.log(this.props.submitFormData)

       // console.log("siteID", siteID);
       // console.log("templateID", templateID);

        const result = await Axios.get(`${API_SINGLE_PDFDESIGN}/${siteID}/${templateID}`)
            .then((response) => {
                if (response.status == 200) {
                    // console.log(response.data, '<======ayo here is the template id we are trying to display')
                    let tempArr = response.data.template;
                    let tableGroupingList_ = tempArr.tableGroupingList || [];
                    // Conditonally calls setImages based on whether submission data is available, otherwise keep original pdf design from db
                     if (Object.keys(this.props.submitFormData) != 0 ) {
                        tempArr.DesignArr = this.setImages(this.props.submitFormData, [...tempArr.DesignArr]);
                     }
                     tempArr.DesignArr.forEach(item1 => {
                        item1.contents.forEach(item2 => {
                            item2.contents.forEach(item3 => {
                                item3.contents.forEach(item4 => {
                                    this.props.submitFormData.tabs.forEach(tab => {
                                        tab.elements.forEach(el => {
                                            if(el._id == item4._id){
                                                item4.label = el.label
                                            }
                                    })
                                })
                                })
                            })
                        })
                     })
                     
                    this.setState({
                        PDFStructure: _.cloneDeep(tempArr.DesignArr),
                        tableGroupingList: tableGroupingList_,
                        loader:false
                    })
                    return response.data;
                } else {
                    return [];

                }
            })
            .then(() => {
               
                // let pagesArrObj = this.calculateAndScalePgDivSize(_.cloneDeep(this.state.PDFStructure));
                // this.setState({
                //     PDFStructure: pagesArrObj.pagesArr,
                //     loader:false,
                //     needMoreScaling: false
                // });
                
               while (this.state.needMoreScaling == true){
                let pagesArrObj = this.calculateAndScalePgDivSize(_.cloneDeep(this.state.PDFStructure));
                //console.log('PDFStructure  pagesArrObj', pagesArrObj)
                   
                this.setState({
                    PDFStructure: pagesArrObj.pagesArr,
                    loader:false,
                    needMoreScaling: pagesArrObj.needMoreScaling,
                    tempDivText: ''
                }, () => {
                    //this.calculateAndScalePgDivSize(_.cloneDeep(this.state.PDFStructure));
                });
               }
            });
        // this.setState({
        //     PDFStructure: [
        //         {
        //             "header": true,
        //             "footer": true,
        //             "type": "newPage",
        //             "title": "Header Number 1",
        //             "pgIndex": 1,
        //             "ref": "pdfPg-1",
        //             "contentsMax": 1,
        //             "contents": [
        //                 {
        //                     "type": "sectionPageHeaderContainer",
        //                     "title": "Installation",
        //                     "display": "full",
        //                     "contentsMax": 2,
        //                     "contents": [
        //                         {
        //                             "type": "section",
        //                             "title": "Section",
        //                             "display": "half",
        //                             "sectionType": "TABLE",
        //                             "contentsMax": 3,
        //                             "contents": [
        //                                 {
        //                                     "type": "input",
        //                                     "inputType": "text",
        //                                     "label": "Project Name",
        //                                     "name": "project name",
        //                                     "value": "",
        //                                     "_id": "1628492746115",
        //                                     "includeToCoverpage": false,
        //                                     "parentSection": "1628492664544",
        //                                     "validations": [
        //                                         {
        //                                             "name": "",
        //                                             "validator": null,
        //                                             "message": ""
        //                                         }
        //                                     ],
        //                                     "id": "1628492746115",
        //                                     "columnHeading": "Data Points",
        //                                     "resultHeading": "As Installed"
        //                                 },
        //                                 {
        //                                     "type": "input",
        //                                     "inputType": "text",
        //                                     "label": "Project Location",
        //                                     "name": "project location",
        //                                     "value": "",
        //                                     "_id": "1628492784984",
        //                                     "includeToCoverpage": false,
        //                                     "parentSection": "1628492664544",
        //                                     "validations": [
        //                                         {
        //                                             "name": "",
        //                                             "validator": null,
        //                                             "message": ""
        //                                         }
        //                                     ],
        //                                     "id": "1628492784984",
        //                                     "columnHeading": "Data Points",
        //                                     "resultHeading": "As Installed"
        //                                 },
        //                                 {
        //                                     "type": "input",
        //                                     "inputType": "number",
        //                                     "label": "Project Number",
        //                                     "name": "project number",
        //                                     "value": "",
        //                                     "_id": "1628492800088",
        //                                     "includeToCoverpage": false,
        //                                     "parentSection": "1628492664544",
        //                                     "validations": [
        //                                         {
        //                                             "name": "",
        //                                             "validator": null,
        //                                             "message": ""
        //                                         }
        //                                     ],
        //                                     "id": "1628492800088",
        //                                     "columnHeading": "Data Points",
        //                                     "resultHeading": "As Installed"
        //                                 }
        //                             ],
        //                             "ref": "Section-1-0-1"
        //                         },
        //                         {
        //                             "type": "section",
        //                             "title": "Section",
        //                             "display": "half",
        //                             "sectionType": "LIST",
        //                             "contentsMax": 3,
        //                             "contents": [
        //                                 {
        //                                     "type": "input",
        //                                     "inputType": "text",
        //                                     "label": "Construction Manager",
        //                                     "name": "construction manager",
        //                                     "value": "",
        //                                     "_id": "1628492922877",
        //                                     "includeToCoverpage": false,
        //                                     "parentSection": "1628492903004",
        //                                     "validations": [
        //                                         {
        //                                             "name": "",
        //                                             "validator": null,
        //                                             "message": ""
        //                                         }
        //                                     ],
        //                                     "id": "1628492922877"
        //                                 },
        //                                 {
        //                                     type: "newLine"
        //                                 },
        //                                 {
        //                                     "type": "input",
        //                                     "inputType": "text",
        //                                     "label": "Phone",
        //                                     "name": "phone",
        //                                     "value": "",
        //                                     "_id": "1628492931593",
        //                                     "includeToCoverpage": false,
        //                                     "parentSection": "1628492903004",
        //                                     "validations": [
        //                                         {
        //                                             "name": "",
        //                                             "validator": null,
        //                                             "message": ""
        //                                         }
        //                                     ],
        //                                     "id": "1628492931593"
        //                                 },
        //                                 {
        //                                     "type": "input",
        //                                     "inputType": "email",
        //                                     "label": "Email",
        //                                     "name": "email",
        //                                     "value": "",
        //                                     "_id": "1628492939750",
        //                                     "includeToCoverpage": false,
        //                                     "parentSection": "1628492903004",
        //                                     "validations": [
        //                                         {
        //                                             "name": "",
        //                                             "validator": null,
        //                                             "message": ""
        //                                         }
        //                                     ],
        //                                     "id": "1628492939750"
        //                                 }
        //                             ],
        //                             "ref": "Section-1-0-2"
        //                         }
        //                     ],
        //                     "ref": "pgHeadSec-1-1"
        //                 }
        //             ]
        //         },
        //         {
        //             "header": true,
        //             "footer": true,
        //             "type": "newPage",
        //             "title": "Pdf New Page",
        //             "pgIndex": 2,
        //             "ref": "pdfPg-2",
        //             "contentsMax": 2,
        //             "contents": [
        //                 {
        //                     "type": "pageContainer",
        //                     "title": "Header 3",
        //                     "display": "full",
        //                     "contentsMax": 1,
        //                     "contents": [
        //                         {
        //                             "type": "section",
        //                             "title": "Section",
        //                             "display": "full",
        //                             "sectionType": "TABLE",
        //                             "contentsMax": 3,
        //                             "contents": [
        //                                 {
        //                                     "type": "radiobutton",
        //                                     "label": "Pre-functional checklist report completed and copy provided to CxA",
        //                                     "name": "pre-functional checklist report completed and copy provided to cxa",
        //                                     "value": "",
        //                                     "options": [
        //                                         "Pass",
        //                                         "Fail",
        //                                         "N/A"
        //                                     ],
        //                                     "_id": "1628494207500",
        //                                     "validations": [],
        //                                     "deficiencyLogRadios": [],
        //                                     "parentSection": "1628494054552",
        //                                     "colors": [
        //                                         {
        //                                             "option": "Pass",
        //                                             "color": ""
        //                                         },
        //                                         {
        //                                             "option": "Fail",
        //                                             "color": ""
        //                                         },
        //                                         {
        //                                             "option": "N/A",
        //                                             "color": ""
        //                                         }
        //                                     ],
        //                                     "functionOptionValue": "",
        //                                     "functionOptionShow": true,
        //                                     "id": "1628494207500",
        //                                     "columnHeading": "Items to Check",
        //                                     "resultHeading": "Melink"
        //                                 },
        //                                 {
        //                                     "type": "radiobutton",
        //                                     "label": "The building pressure switch has been installed",
        //                                     "name": "the building pressure switch has been installed",
        //                                     "value": "",
        //                                     "options": [
        //                                         "Pass",
        //                                         "Fail",
        //                                         "N/A"
        //                                     ],
        //                                     "_id": "1628494312019",
        //                                     "validations": [],
        //                                     "deficiencyLogRadios": [],
        //                                     "parentSection": "1628494054552",
        //                                     "colors": [
        //                                         {
        //                                             "option": "Pass",
        //                                             "color": ""
        //                                         },
        //                                         {
        //                                             "option": "Fail",
        //                                             "color": ""
        //                                         },
        //                                         {
        //                                             "option": "N/A",
        //                                             "color": ""
        //                                         }
        //                                     ],
        //                                     "functionOptionValue": "",
        //                                     "functionOptionShow": true,
        //                                     "id": "1628494312019",
        //                                     "columnHeading": "Items to Check",
        //                                     "resultHeading": "Melink"
        //                                 },
        //                                 {
        //                                     "type": "radiobutton",
        //                                     "label": "The Power Exhaust has been installed",
        //                                     "name": "the power exhaust has been installed",
        //                                     "value": "",
        //                                     "options": [
        //                                         "Pass",
        //                                         "Fail"
        //                                     ],
        //                                     "_id": "1628494347417",
        //                                     "validations": [],
        //                                     "deficiencyLogRadios": [],
        //                                     "parentSection": "1628494054552",
        //                                     "colors": [
        //                                         {
        //                                             "option": "Pass",
        //                                             "color": ""
        //                                         },
        //                                         {
        //                                             "option": "Fail",
        //                                             "color": ""
        //                                         }
        //                                     ],
        //                                     "functionOptionValue": "",
        //                                     "functionOptionShow": true,
        //                                     "id": "1628494347417",
        //                                     "columnHeading": "Items to Check",
        //                                     "resultHeading": "Melink"
        //                                 }
        //                             ],
        //                             "ref": "Section-2-0-1"
        //                         }
        //                     ],
        //                     "ref": "pgContainer-2-1"
        //                 },
        //                 {
        //                     "type": "pageContainer",
        //                     "title": "Pdf Page Container",
        //                     "display": "full",
        //                     "contentsMax": 0,
        //                     "contents": [],
        //                     "ref": "pgContainer-2-2"
        //                 }
        //             ]
        //         }
        //     ]
        // })
    }

    calculateAndScalePgDivSize = (pagesArr) => {
        let needMoreScaling = false;
        let newPagesArr = [];
        for(let i=0; i<pagesArr.length; i++){
            //checking all pages sizes
            let height = document.getElementById(pagesArr[i].ref).clientHeight;
            // console.log('PDFStructure ', pagesArr[i].ref);
            // console.log('PDFStructure title : ', pagesArr[i].title);
            // console.log('PDFStructure required height ', height);
                    let elements = document.getElementById(pagesArr[i].ref).children;
                    let actualHeight = 0;
                    for (let j = 0; j <= elements.length - 1; j++) {
                        actualHeight = actualHeight + elements[j].clientHeight;
                    }
                    //console.log('PDFStructure required actual ', actualHeight);
                    //if the page components/divs combined height is more then the normal page size
                    if(actualHeight > 960){
                        needMoreScaling = true;
                      //  console.log('PDFStructure new page needed', pagesArr[i].ref);
                        let currentPage = pagesArr[i];


                        
                        let newPage = _.cloneDeep(currentPage);
                        const random = Math.random().toString().substr(2, 5)
                        let pgmaxindex_ = pagesArr.length + random;
                        newPage.ref = "pdfPgScaled-" + pgmaxindex_;

                        this.processAndScaleNewAndCurrentPages(currentPage, newPage);
                        newPagesArr.push({index: i , newPage:newPage});


                        //console.log('PDFStructure current page elements ', currentPage.contents.length)
                    }

        }
        console.log('PDFStructure newPagesArr ', newPagesArr)

        /*for(let k=0; k<newPagesArr.length; k++){
            let tempPg = JSON.parse(JSON.stringify(newPagesArr[k].newPage));
            pagesArr.splice((newPagesArr[k].index + 1 ), 0, tempPg);
            //pagesArr.push(newPagesArr[k].newPage);
        }*/

        let finalPagesArr = [];
        for(let k=0; k<pagesArr.length; k++){

                let tempPg_new = JSON.parse(JSON.stringify(pagesArr[k]));
                finalPagesArr.push(tempPg_new);

                for(let l=0; l<newPagesArr.length; l++){
                    if(newPagesArr[l].index == k){
                        let tempPg = JSON.parse(JSON.stringify(newPagesArr[l].newPage));
                        finalPagesArr.push(tempPg);
                    }
                }
        }

        //return pagesArr;
        return {needMoreScaling: needMoreScaling, pagesArr: finalPagesArr};
            

        

    }

    processAndScaleNewAndCurrentPages = (currentPage, newPage) => {
        console.log('page title : ', currentPage.title);
        console.log('page title currentPage : ', currentPage);
        console.log('page title newPage : ', newPage);
        
        let nextActionForNextPageItems = 'MOVE_LAST_SECTION_AHEAD';
        let currentPageInnerContents = [];
        let newPageInnerContents = [];
                

        //process last element of the page which is not a fixed element
        let currentPageContents = currentPage.contents;
        let lastPageElementFound = false;
        for (let i=currentPageContents.length; i>0; i--){
            console.log('page title each element of page : ', currentPageContents[i-1]);
            if(currentPageContents[i-1].type == "pageContainer" && lastPageElementFound == false){
                lastPageElementFound = true;
                console.log('page title lastPageElementFound : ', currentPageContents[i-1]);
                let innerSectionsContents = currentPageContents[i-1].contents;
                let innerBigElementFound = false;
                for (let j=0; j<innerSectionsContents.length; j++){

                    if(innerSectionsContents[j].sectionType == "DEFICIENCYLOG" && innerSectionsContents[j].Deficiencycontents.values.length > 15 && innerBigElementFound == false){
                            let DefValuesArr = innerSectionsContents[j].Deficiencycontents.values;
                            let leftSide = DefValuesArr.splice(0, Math.ceil(DefValuesArr.length /2));
                            let rightSide = DefValuesArr;
                            // currentPageInnerContents.push({
                            //     headings : innerSectionsContents[j].Deficiencycontents.headings,
                            //     values : leftSide
                            // });
                            innerSectionsContents[j].Deficiencycontents.values = leftSide;
                            newPageInnerContents = {
                                headings : innerSectionsContents[j].Deficiencycontents.headings,
                                values : rightSide
                            };
                            innerBigElementFound = true;
                            nextActionForNextPageItems = 'REPLACE_INNER_CONTENTS';
                            
                    }else if(innerSectionsContents[j].sectionType == "TABLE" && innerSectionsContents[j].contents.length > 15 && innerBigElementFound == false){
                        let DefValuesArr = innerSectionsContents[j].contents;
                        let leftSide = DefValuesArr.splice(0, Math.ceil(DefValuesArr.length /2));
                        let rightSide = DefValuesArr;
                        innerSectionsContents[j].contents = leftSide;
                        newPageInnerContents = rightSide;
                        innerBigElementFound = true;
                        nextActionForNextPageItems = 'REPLACE_INNER_CONTENTS';
                        
                }else if(innerSectionsContents[j].sectionType == "LIST" && innerBigElementFound == false){
                        let listInnerContents = innerSectionsContents[j].contents;
                        console.log(listInnerContents)
                        let tempContents = [];
                        for (let m=0; m<listInnerContents.length; m++){
                            console.log('listInnerContents[m].type => ', listInnerContents[m].type, 'listInnerContents[m].value.length -> ', listInnerContents[m].value.length);
                            let enteredText = listInnerContents[m].value;
                            let tempHeigthDiv;
                            this.setState({tempDivText: enteredText}, () => {
                            tempHeigthDiv = document.getElementsByClassName('myTempDiv');
                            console.log('tempHeigthDiv ------------- ', tempHeigthDiv[0].clientHeight);
                            });
                            if(listInnerContents[m].type == 'textarea' && ( listInnerContents[m].value.length > 1500 || tempHeigthDiv[0].clientHeight > 500 ) && innerBigElementFound == false){
                                //let chunks = [];
                                let str = listInnerContents[m].value;
                                //let leftSide = str.substring(0,1499);
                                //let rightSide = str.substring(1500,str.length);
                                let middle = Math.floor(str.length / 2);
                                let before = str.lastIndexOf(' ', middle);
                                let after = str.indexOf(' ', middle + 1);
                                if(before == -1){
                                    before = str.lastIndexOf('>', middle);
                                    after = str.indexOf('>', middle + 1);
                                }
                                
                                
                                if(before != -1){
                                    if (middle - before < after - middle) {
                                        middle = before;
                                    } else {
                                        middle = after;
                                    }
                                }
                                

                                let s1 = str.substr(0, middle);
                                let s2 = str.substr(middle + 1);
                                listInnerContents[m].trimText = s1; //leftSide;
                                tempContents.push(listInnerContents[m]);
                                //newPageInnerContents = rightSide;
                                innerBigElementFound = true;
                                nextActionForNextPageItems = 'REPLACE_INNER_CONTENTS';
                             }else if(listInnerContents[m].type == 'radiobutton'){
                                nextActionForNextPageItems = 'REPLACE_INNER_CONTENTS';
                            }else{
                                if(listInnerContents[m].type == 'textarea' && innerBigElementFound == false){
                                    tempContents.push(listInnerContents[m])
                                }
                            }
                        }
                        innerSectionsContents[j].contents = tempContents;
                        console.log('tempContents ', tempContents);
                        
                    }else{
                        currentPageInnerContents.push(innerSectionsContents[j])
                    }


                    


                }
                console.log('currentPageInnerContents ', currentPageInnerContents);
                console.log('newPageInnerContents ', newPageInnerContents);
                

            }
            
        }
        console.log('nextActionForNextPageItems => ', nextActionForNextPageItems);
        
        //-------------------------------------------------new page 
        
        let newPageContents = newPage.contents;
        let CurrentPageContents = currentPage.contents;
        if(nextActionForNextPageItems == 'REPLACE_INNER_CONTENTS'){
            let lastPageElementFound2 = false;
            let innerBigElementFound2 = false;
            for (let i=newPageContents.length; i>0; i--){
                if(newPageContents[i-1].type == "pageContainer" && lastPageElementFound2 == false){
                    lastPageElementFound2 = true;
                    for (let j=0; j<newPageContents[i-1].contents.length; j++){
                        if(newPageContents[i-1].contents[j].sectionType == "DEFICIENCYLOG" && newPageContents[i-1].contents[j].Deficiencycontents.values.length > 15 && innerBigElementFound2 == false){
                            newPageContents[i-1].contents[j].Deficiencycontents = newPageInnerContents;
                            newPageContents[i-1].contents[j].contents = [];
                            innerBigElementFound2 = true;
                        }else if(newPageContents[i-1].contents[j].sectionType == "TABLE" && newPageContents[i-1].contents[j].contents.length > 15 && innerBigElementFound2 == false){
                            //newPageContents[i-1].contents[j].Deficiencycontents = newPageInnerContents;
                            newPageContents[i-1].contents[j].contents = newPageInnerContents;
                            innerBigElementFound2 = true;
                        }else if(newPageContents[i-1].contents[j].sectionType == "LIST" && innerBigElementFound2 == false){
                            let listInnerContents = newPageContents[i-1].contents[j].contents;
                            let tempContents = [];
                            for (let m=0; m<listInnerContents.length; m++){
                                let enteredText = listInnerContents[m].value;
                                let tempHeigthDiv;
                                this.setState({tempDivText: enteredText}, () => {
                                tempHeigthDiv = document.getElementsByClassName('myTempDiv');
                                });
                                if(listInnerContents[m].type == 'textarea' && ( listInnerContents[m].value.length > 1500 || tempHeigthDiv[0].clientHeight > 500 ) && innerBigElementFound2 == false){
                                    let chunks = [];
                                    let str = listInnerContents[m].value;
                                    //let leftSide = str.substring(0,1499);
                                    //let rightSide = str.substring(1500,str.length);
                                    let middle = Math.floor(str.length / 2);
                                    let before = str.lastIndexOf(' ', middle);
                                    let after = str.indexOf(' ', middle + 1);
                                    if(before == -1){
                                        before = str.lastIndexOf('>', middle);
                                        after = str.indexOf('>', middle + 1);
                                    }

                                    if(before != -1){
                                        if (middle - before < after - middle) {
                                            middle = before;
                                        } else {
                                            middle = after;
                                        }
                                    }

                                    let s1 = str.substr(0, middle);
                                    let s2 = str.substr(middle + 1);
                                    listInnerContents[m].trimText = s2; //rightSide;
                                    tempContents.push(listInnerContents[m]);
                                    //newPageInnerContents = rightSide;
                                    innerBigElementFound2 = true;
                                }else if(listInnerContents[m].type == 'radiobutton'){
                                    if( m >= (listInnerContents.length / 2)  )
                                    {
                                        tempContents.push(listInnerContents[m])
                                    }else{
                                        CurrentPageContents[i-1].contents[j].contents.push(listInnerContents[m])
                                    }
                                    

                                }else{
                                    if(listInnerContents[m].type == 'textarea' && innerBigElementFound2 == true){
                                        tempContents.push(listInnerContents[m])
                                    }
                                    
                                }
                                
                            }
                            newPageContents[i-1].contents[j].contents = tempContents;
                        }
                }
    
            }
        }
    }



    if(nextActionForNextPageItems == 'MOVE_LAST_SECTION_AHEAD'){
        let lastPageElementFound2 = false;
        let singleElementInLastSection = false;
                for (let i=newPageContents.length; i>0; i--){
                    if(newPageContents[i-1].type == "pageContainer" && lastPageElementFound2 == false){
                        lastPageElementFound2 = true;
                        for (let j=0; j<newPageContents[i-1].contents.length; j++){
                            if(j == (newPageContents[i-1].contents.length - 1)){
                                console.log('j ', j);
                                let listInnerContents = newPageContents[i-1].contents[j].contents;
                                console.log('listInnerContents 0000000 ', listInnerContents);
                                if(listInnerContents.length == 1){
                                    singleElementInLastSection = true;
                                }else{
                                    singleElementInLastSection = true;
                                    
                                    let tempContents = [];
                                    let tempContents_for_currentPage = [];
                                    let totalHeight = 0;
                                    for (let m=0; m<listInnerContents.length; m++){
                                        if(listInnerContents[m].type == 'textarea'){
                                            singleElementInLastSection = false;
                                            let enteredText = listInnerContents[m].value;
                                            let tempHeigthDiv;
                                            this.setState({tempDivText: enteredText}, () => {
                                            tempHeigthDiv = document.getElementsByClassName('myTempDiv');
                                            totalHeight = totalHeight + tempHeigthDiv[0].clientHeight;
                                            });
                                            console.log('total height ', totalHeight);
                                            //if(m == (listInnerContents.length - 1) ){
                                            if(totalHeight > 700){    
                                                tempContents.push(listInnerContents[m]); 
                                            }else{
                                                tempContents_for_currentPage.push(listInnerContents[m]); 
                                            }
                                        }
                                        
                                    }
                                    if(singleElementInLastSection == false ){
                                        newPageContents[i-1].contents[j].contents = tempContents;
                                        CurrentPageContents[i-1].contents[j].contents = tempContents_for_currentPage;
                                        console.log('tempContents ', tempContents );
                                        console.log('tempContents_for_currentPage ', tempContents_for_currentPage );
                                    }
                                    
                                }
                                
                            }
                        }

                        if(singleElementInLastSection == true){
                            console.log('newPageContents[i-1].contents ', newPageContents[i-1].contents)
                            let tmp1 = newPageContents[i-1].contents.pop();
                            console.log('tmp1 ', tmp1);
                            CurrentPageContents[i-1].contents = newPageContents[i-1].contents;
                            newPageContents[i-1].contents = [tmp1];

                        }
                }
            }
        }
        
        
        console.log('newPage ', newPage);
        console.log('currentPage ', currentPage);

    
    }

    createCharts = () => {
        let submitFormData = this.props.submitFormData;
        let projectName,locationStore, locationStreet, locationCity, locationState, locationZip, date, formattedDate = '';
        // Conditonally sets data if available, otherwise leave
        if (Object.keys(submitFormData) != 0) {
        for (let i = 0; i < submitFormData.tabs.length; i++) {
            for (let j = 0; j < submitFormData.tabs[i].elements.length; j++) {
                if (submitFormData.tabs[i].elements[j].childTag == "project_name") {
                    projectName = submitFormData.tabs[i].elements[j].value;
                } else if (submitFormData.tabs[i].elements[j].childTag == "location_store") {
                    locationStore = ' #' + submitFormData.tabs[i].elements[j].value;
                } else if (submitFormData.tabs[i].elements[j].childTag == "location_street") {
                    locationStreet = submitFormData.tabs[i].elements[j].value;
                } else if (submitFormData.tabs[i].elements[j].childTag == "location_city") {
                    locationCity = submitFormData.tabs[i].elements[j].value;
                } else if (submitFormData.tabs[i].elements[j].childTag == "location_state") {
                    locationState = submitFormData.tabs[i].elements[j].value;
                }else if (submitFormData.tabs[i].elements[j].childTag == "location_zip") {
                    locationZip = submitFormData.tabs[i].elements[j].value;
                }
                else if (submitFormData.tabs[i].elements[j].childTag == "date") {
                    if (submitFormData.tabs[i].elements[j].value != "") {
                        date = submitFormData.tabs[i].elements[j].value.substring(0,10)
                        formattedDate = (date.substring(5,11) + '/' + date.substring(0,4)).replace('-', '/')
                    }
                }

            }
        }}
        // return <div className="container col-sm-12">
        return <div>
            <div className='myTempDiv'>{ReactHtmlParser(this.state.tempDivText)}</div>
            {this.state.PDFStructure.map((e1, i1) => {
                //console.log("pages", e1)
                let divIndexOne = i1;
                let e1Contents = e1.contents;
                let e1ActiveCls = (this.state.activeSection == "pdfPg-" + e1.pgIndex) ? 'activepdfSection' : '';
                return (

                    //each new page div starts here...                                    
                    <div id={e1.ref} className={e1ActiveCls + " pdf-new-page-A4  "}

                    >
                        {(e1.type == 'coverPage') && <img src="/assets/images/pdf-cover/pdf-cover-logo.png" alt="MeLink" className="pdf-cover-logo" />}

                        {(e1.title != '' && e1.title != 'Pdf New Page') && <h3 className={(e1.type == 'coverPage') ? 'pdf-cover-title' : 'pdf-title'}>{e1.title}</h3>}
                        <Row className="pdf-header1-cls">
                            {(e1.header) &&
                                <Col md="8" >
                                    <div className="pdf-header-date">
                                        <div className="pdf-label-header">PROJECT: </div>
                                        <div className="pdf-underline">{projectName}{locationStore}</div>
                                    </div>

                                </Col>}
                            {(e1.header) &&
                                <Col md="4" >
                                    <div className="pdf-header-date">
                                        <div className="pdf-label-header">DATE: </div>
                                        <div className="pdf-underline">{formattedDate}</div>
                                    </div>
                                </Col>}

                        </Row>
                        <Row className="pdf-header2-cls">
                            {(e1.header) &&
                                <Col md="8" >
                                    <div className="pdf-header-date">
                                        <div className="pdf-label-header">LOCATION: </div>
                                        <div className="pdf-underline">{locationStreet} {locationCity} {locationState} {locationZip}</div>
                                    </div>
                                </Col>}
                        </Row>



                        {e1Contents.map((e2, i2) => {
                            let e2Contents = e2.contents || [];

                            let divClass = (e2.type == 'sectionPageHeaderContainer') ? 'pdf-page-header-section-A4' : 'pdf-page-container-A4';
                            divClass += (e2.display == 'full') ? ' col-10 ' : ' col-sm-5  col-sm-offset-1';
                            divClass += (this.state.activeSection == e2.ref) ? ' activepdfSection' : '';
                            return (
                                <div key={i2} className={divClass} >
                                    {(e2.title != 'Pdf Page Header Section' && e2.title != 'Pdf Page Container' && e2.title != '') && <h3 className="pdf-inner-section">{e2.title}{/*e2.title +' '+ e2.ref*/} </h3>}
                                    {e2Contents.map((e3, i3) => {
                                        if (e3.sectionType === 'TABLE') {

                                            let e3Contents = e3.contents || [];
                                            let showFunction = e3.showFunction || false;
                                            let showInterface = e3.showInterface || false;
                                            let showRefNo = e3.showRefNo || false;
                                            let table = this.generateTableJSON(e3Contents, showFunction, showInterface, showRefNo, this.state.tableGroupingList);
                                            //console.log("table", e3.ref);
                                            let groupIndexObj = this.setGroupingIndex(table);
                                            let tableHeader;
                                            let divClass = (e3.type == 'section') ? 'pdf-page-section-A4' : 'pdf-page-section-A4';
                                            divClass += (e3.display == 'full') ? ' col-12  ' : ' col-sm-6 '; //' col-sm-5  col-sm-offset-1 ';
                                            return (
                                                <div key={i3} className={divClass} >
                                                    {(e3.title != 'Section' && e3.title != '') && <h3 className="pdf-inner-section">{e3.title}</h3>}
                                                    <table className="pdf-table">
                                                        <tr>

                                                            {
                                                                this.tableHeading(table.headings)
                                                            }


                                                        </tr>
                                                        {
                                                            this.tableRows(table.values, groupIndexObj)
                                                        }

                                                    </table>
                                                </div>
                                            )

                                        } else if (e3.sectionType === 'DEFICIENCYLOG') {
                                            let e3Contents = e3.contents || [];
                                            let showFunction = e3.showFunction || false;
                                            let showInterface = e3.showInterface || false;
                                            let showRefNo = e3.showRefNo || false;
                                            if(this.state.processDeficiencyTable == false){
                                                let table = this.generateTableJSON_Deficiency(this.props.submitFormData, showFunction, showInterface);
                                                // console.log("table DEFICIENCYLOG ", table);
                                                    e3.Deficiencycontents = table;
                                                    this.setState({processDeficiencyTable: true})
                                            }
                                            
                                            let groupIndexObj = {};
                                            let tableHeader;
                                            let divClass = (e3.type == 'section') ? 'pdf-page-section-A4' : 'pdf-page-section-A4';
                                            divClass += (e3.display == 'full') ? ' col-12  ' : ' col-sm-6 '; //' col-sm-5  col-sm-offset-1 ';
                                            return (
                                                <div key={i3} className={divClass} >
                                                    {(e3.title != 'Section' && e3.title != '') && <h3 className="pdf-inner-section">{e3.title}</h3>}
                                                    <table className="pdf-table">
                                                        <tr>

                                                            {
                                                                //this.tableHeading(table.headings)
                                                                this.tableHeading(e3.Deficiencycontents.headings)
                                                            }


                                                        </tr>
                                                        {
                                                            //this.tableRows(table.values, groupIndexObj)
                                                            this.tableRows(e3.Deficiencycontents.values, groupIndexObj)
                                                        }

                                                    </table>
                                                </div>
                                            )

                                        } else if (e3.sectionType === 'LIST') {
                                            let divClass = (e3.type == 'section') ? 'pdf-page-section-A4' : 'pdf-page-section-A4';
                                            divClass += (e3.display == 'full') ? ' col-12  ' : ' col-sm-6 '; //' col-sm-5  col-sm-offset-1 ';
                                            return (
                                                <div key={i3} className={divClass}  >
                                                    {(e3.title != 'Section' && e3.title != '') && <h3 className="pdf-title-section">{e3.title}</h3>}

                                                    {this.generateList(e3.contents, e3.showRefNo, e1, projectName,locationStore, locationStreet, locationCity, locationState, locationZip, formattedDate)}

                                                </div>
                                            )

                                        } else if (e3.sectionType === 'TEXT') {
                                            let divClass = (e3.type == 'section') ? 'pdf-page-section-A4' : 'pdf-page-section-A4';
                                            divClass += (e3.display == 'full') ? ' col-12  ' : ' col-sm-6 '; //' col-sm-5  col-sm-offset-1 ';
                                            divClass += ' pdf-static-text ';
                                            return (
                                                <div key={i3} className={divClass}  >
                                                    {(e3.title != 'Section' && e3.title != '') ? <div className='pdf-inner-section' >{e3.title}</div> : null}

                                                    {ReactHtmlParser(e3.staticText)}

                                                </div>
                                            )

                                        } else if (e3.sectionType === 'IMAGE') {
                                            let divClass = (e3.type == 'section') ? 'pdf-page-section-A4' : 'pdf-page-section-A4';
                                            divClass += (e3.display == 'full') ? ' col-12  ' : ' col-12 '; //' col-sm-5  col-sm-offset-1 ';
                                            let showRefNo = e3.showRefNo || false;
                                            return (
                                                <div key={i3} className={divClass}>
                                                    {(e3.title != 'Section' && e3.title != '') ? <div className='pdf-inner-section' >{e3.title}</div> : null}

                                                    {this.generateImages(e3.contents, e3.imageSectionType, showRefNo)}
                                                </div>
                                            )

                                        } else if (e3.sectionType === 'SIGNATURE') {
                                            let divClass = (e3.type == 'section') ? 'pdf-page-section-A4' : 'pdf-page-section-A4';
                                            divClass += (e3.display == 'full') ? ' col-12  ' : ' col-12 '; //' col-sm-5  col-sm-offset-1 ';
                                            let showRefNo = e3.showRefNo || false;

                                            return (
                                                <div key={i3} className={divClass}>
                                                    {this.generateSignatures(e3.contents,showRefNo)}
                                                </div>
                                            )

                                        }


                                    })}

                                </div>

                            )

                        })}
                        {(e1.coverPageText) && <div className="pdf-cover-text">{ReactHtmlParser(e1.coverPageText)} </div>}
                        {(e1.type == 'coverPage') && <div className="pdf-cover-footer-2021">© 2021 Melink Corporation All Rights Reserved</div>}


                        {(e1.footer && e1.type != 'coverPage') && <div className="pdf-footer">© 2021 Melink Corporation All Rights Reserved

                            <Row>
                                {(e1.footer) && <Col md="7" className="pdf-confidential"><i>Confidential</i></Col>}
                                {(e1.footer) && <Col md="5" className="pdf-page-number">Page {i1 + 1}</Col>}
                            </Row>

                        </div>}

                        {(e1.footer && e1.type == 'coverPage') && <div className="pdf-cover-footer">Melink Corporation

                            <Row>
                                {(e1.footer) && <Col md="7" className="pdf-confidential"><i>Confidential</i></Col>}
                                {(e1.footer) && <Col md="5" className="pdf-page-number">Page {i1 + 1}</Col>}
                            </Row>

                        </div>}



                    </div>
                )
            })}

        </div>;

    }
    generateSignatures = (signatureContents, showRefNo) => {
        let list = [];
        let col1 = [], col2 = [], col3 = [];
        for (let i = 0; i < signatureContents.length; i++) {
           // console.log("sig content", signatureContents)
            if (signatureContents[i].type === 'signature') {
                if (signatureContents[i].value != "") {
                    col3.push(
                        <Col sm="4" md="4" lg="4">
                            <img src={signatureContents[i].value} style={{ display: "block", margin: "10px auto", width: "auto", height: "43px" }} />
                            <p className="pdf-signature-input" style={{ textAlign: "center" }}></p>
                            <p style={{ textAlign: "center", textTransform: "capitalize", fontFamily: "Calibri", fontSize: "11px" }}><b><span className={showRefNo ? '' : 'hideDiv'}> {signatureContents[i].index} </span>{signatureContents[i].label}</b></p>
                        </Col>
                    )
                } else {
                    col3.push(
                        <Col sm="4" md="4" lg="4"  style={{ marginTop: "47px" }} >
                           <p style={{ textAlign: "center" }} className="pdf-signature-input"> N/A</p>
                            <p style={{ textAlign: "center", textTransform: "capitalize", fontFamily: "Calibri", fontSize: "11px" }}><b><span className={showRefNo ? '' : 'hideDiv'}> {signatureContents[i].index} </span>{signatureContents[i].label}</b></p>
                        </Col>
                    )
                }


            } 
            else if (signatureContents[i].type === 'input') {
                if (signatureContents[i].name == 'date:' || signatureContents[i].name == 'date') {
                    if (signatureContents[i].value != "") {
                        col2.push(
                            <Col sm="4" md="4" lg="4" >
                                <p style={{ textAlign: "center"}} className="pdf-signature-input" >{signatureContents[i].value}</p>
                                <p style={{ textAlign: "center", textTransform: "capitalize", fontFamily: "Calibri", fontSize: "11px" }}> <b><span className={showRefNo ? '' : 'hideDiv'}> {signatureContents[i].index} </span>{signatureContents[i].label}</b></p>
                            </Col>
                        )
                    } else {
                        col2.push(
                            <Col sm="4" md="4" lg="4" >
                                <p style={{ textAlign: "center" }} className="pdf-signature-input"> N/A</p>
                                <p style={{ textAlign: "center", textTransform: "capitalize", fontFamily: "Calibri", fontSize: "11px" }}><b><span className={showRefNo ? '' : 'hideDiv'}> {signatureContents[i].index} </span>{signatureContents[i].label}</b></p>
                            </Col>
                        )
                    }

                } else {
                    if (signatureContents[i].value != "") {
                        col1.push(
                            <Col sm="4" md="4" lg="4" >
                                <p style={{ textAlign: "center" }} className="pdf-signature-input">{signatureContents[i].value} </p>
                                <p style={{ textAlign: "center", textTransform: "capitalize", fontFamily: "Calibri", fontSize: "11px" }}><b><span className={showRefNo ? '' : 'hideDiv'}> {signatureContents[i].index} </span>{signatureContents[i].label}</b></p>
                            </Col>

                        )
                    } else {
                        col1.push(
                            <Col sm="4" md="4" lg="4" >
                                <p style={{ textAlign: "center" }} className="pdf-signature-input"> N/A</p>
                                <p style={{ textAlign: "center", textTransform: "capitalize", fontFamily: "Calibri", fontSize: "11px" }}><b><span className={showRefNo ? '' : 'hideDiv'}> {signatureContents[i].index} </span>{signatureContents[i].label}</b></p>
                            </Col>

                        )
                    }


                }

            }

        }
        for (let i = 0; i < col1.length; i++) {
            let cols = [];
            cols.push(col1[i])
            cols.push(col2[i])
            cols.push(col3[i])      
            list.push(
                <Row style={{display:"flex", alignItems:"end"}}>         
                        {col1[i]}
                        {col2[i]}
                        {col3[i]}          
                </Row>
            )
      
            
        }
        //   col1 = col1.concat(col2);
        //   col1 = col1.concat(col3)
        //   list = list.concat(col1);
        //list", list)
        return list;


    }

    generateImages = (imageContents, imageSectionType, showRefNo) => {
        let list = [];
        if (imageSectionType === "single") {
            for (let i = 0; i < imageContents.length; i++) {
                if (imageContents[i].type === 'image') {
                    if (imageContents[i].value != "") {

                        if (list.length < 1) {
                            if(showRefNo){
                                list.push(
                                    <div>
                                        <img src={imageContents[i].value[0].img} style={{ display: "block", margin: "10px auto", height: "700px", width: "555px" }} />
                                        <p style={{ textAlign: "center", textTransform: "capitalize", color: "black", fontFamily: "Calibri", fontSize: "11px" }}><b>{imageContents[i].index}</b>{imageContents[i].label} {imageContents[i].value[0].caption}</p>
                                    </div>)

                            }else{
                                list.push(
                                    <div>
                                        <img src={imageContents[i].value[0].img} style={{ display: "block", margin: "10px auto", height: "700px", width: "555px" }} />
                                        <p style={{ textAlign: "center", textTransform: "capitalize", color: "black", fontFamily: "Calibri", fontSize: "11px" }}>{imageContents[i].label} {imageContents[i].value[0].caption}</p>
                                    </div>)
                                
                            }
                            
                        }
                    }

                }

            }
        } else {
            for (let i = 0; i < imageContents.length; i++) {
                //console.log("imagecon",imageContents[i])
                if (imageContents[i].type === 'image') {
                    if (imageContents[i].value != "") {
                        if(showRefNo){
                            list.push(      
                                <Col sm="6">
                                    <img src={imageContents[i].value[0].img} style={{ width: "300px", height: "200px", marginTop:"20px"}}/>
                                    <p style={{ textTransform: "capitalize", color: "black", fontFamily: "Calibri", fontSize: "11px" }}><b>{imageContents[i].index} {imageContents[i].label}</b> {imageContents[i].value[0].caption}</p>
                                </Col>
                            )

                        }else{
                            list.push(      
                                <Col sm="6">
                                    <img src={imageContents[i].value[0].img} style={{ width: "300px", height: "200px", marginTop:"20px"}}/>
                                    <p style={{ textTransform: "capitalize", color: "black", fontFamily: "Calibri", fontSize: "11px" }}><b>{imageContents[i].label}</b> {imageContents[i].value[0].caption}</p>
                                </Col>
                            )

                        }

                    }

                }

            }
        }
        return list;

    }
    addNewPage = (page, pgContainer, section, sectionContents, PDFStructure, index) => {
       //console.log("imagecontents", sectionContents); 
        //console.log("pdfs", PDFStructure)
        const random = Math.random().toString().substr(2, 5)
        let pgmaxindex_ = PDFStructure.length + random;

        let item = {
            header: true,
            footer: true,
            type: 'newPage',
            title: page.title,
            pgIndex: pgmaxindex_,
            ref: "pdfPgAdded-" + pgmaxindex_,
            contentsMax: 0,
            contents: []
        };
        item.contents.push({...pgContainer});
        item.contents[0].ref = "pg"+pgmaxindex_;
        item.contents[0].contents = [];
        item.contents[0].contents.push(_.cloneDeep(section));
        item.contents[0].contents[0].ref = "Section-"+pgmaxindex_;
        item.contents[0].contents[0].contents = [];
        item.contents[0].contents[0].contents = _.cloneDeep(sectionContents);
        PDFStructure.splice(index, 0, item);
        return _.cloneDeep(PDFStructure);

    }


    generateList = (listContents, showRefNo, e1, projectName, locationStore, locationStreet, locationCity, locationState, locationZip, formattedDate ) => {
        let list = [];
        for (let i = 0; i < listContents.length; i++) {
            // list elememt from teatarea
            if (listContents[i].type === 'textarea') {
                listContents[i].value = (listContents[i].trimText) ? listContents[i].trimText : listContents[i].value;
                if (showRefNo) {
                    list.push(<div>  <span className={(e1.type == 'coverPage') ? 'pdf-cover-list-title' : 'pdf-list-textarea'} >{listContents[i].index} {listContents[i].label} {ReactHtmlParser(listContents[i].value)} </span></div>);
                } else {
                    list.push(<div>  
                        <span className={(e1.type == 'coverPage') ? 'pdf-cover-list-title' : 'pdf-list-textarea'} > 
                    <p style={{textAlign: 'center'}}>
                        <b>{listContents[i].label.includes(':')? listContents[i].label.split(':').length > 0 ? listContents[i].label.split(':')[0] : listContents[i].label :  listContents[i].label} </b> 
                        </p>
                     {ReactHtmlParser(listContents[i].value)}
                       </span>
                       </div>);
                }
            }
            else if (listContents[i].type === 'newLine') {
                list.push(<br></br>)
            } else {
                if (showRefNo) {
                    list.push(<div className="pdf-list-parent row ">
                        <span className={(e1.type == 'coverPage') ? 'pdf-cover-list-title col-md-5' : 'pdf-list-title col-md-5'} >{listContents[i].index} {listContents[i].label}  </span>
                        <span className={(e1.type == 'coverPage') ? 'pdf-cover-list-result col-md-5' : 'pdf-list-result col-md-5'} > {ReactHtmlParser(listContents[i].value)} </span>
                        <span className="col-md-2" >  </span>
                    </div>);
                } else {
                    list.push(<div className="pdf-list-parent row ">
                    <span className={(e1.type == 'coverPage') ? 'pdf-cover-list-title col-md-5' : 'pdf-list-title col-md-5'} >{listContents[i].label}  </span>
                    <span className={(e1.type == 'coverPage') ? 'pdf-cover-list-result col-md-5' : 'pdf-list-result col-md-5'}>
                    {listContents[i].inputType === 'date' ?  (listContents[i].value ? moment(listContents[i].value).format('MM/DD/YYYY') : '')
                    : listContents[i].id == '2' ? (projectName ? projectName + locationStore : '') 
                    : listContents[i].id == '3' ? (locationStreet ? locationStreet + ' ' + locationCity + ' ' + locationState + ' ' + locationZip : '') 
                    : listContents[i].id == '4' ? (formattedDate ? formattedDate : '')
                    : ReactHtmlParser(listContents[i].value)}
                    </span>
                    <span className="col-md-2" ></span>
                </div>);
                }

            }
        }
        return list;
    }

    tableHeading = (headersList) => {
        let tempArr = [];
        for (let i = 0; i < headersList.length; i++) {
            tempArr.push(<th className="pdf-heading">{headersList[i]}</th>);
        }
        return tempArr;
    }

    // tableRows = (rowsList) => {
    //     let rows = [];
    //     for (let i = 0; i < rowsList.length; i++) {
    //         let cells = [];
    //         for (let j = 0; j < rowsList[i].length; j++) {
    //             cells.push(<td className="pdf-row">{ReactHtmlParser(rowsList[i][j])}</td>);
    //         }
    //         rows.push(<tr>{cells}</tr>)
    //     }
    //     return rows;
    // }

    tableRows = (rowsList, groupIndexObj) => {
        let rows = [];
        for (let i = 0; i < rowsList.length; i++) {
            let cells = [];
            for (let j = 0; j < rowsList[i].length; j++) {
                let lastIndexOfLoopJ = rowsList[i].length - 1;
                if (groupIndexObj[rowsList[i][j]] && groupIndexObj[rowsList[i][j]].length > 0 && (j != lastIndexOfLoopJ)) {
                    //console.log(`groupIndexObj val ${rowsList[i][j]} `, groupIndexObj[rowsList[i][j]]);
                    //console.log(`value found current index ${i}${j} `, groupIndexObj[rowsList[i][j]]);  
                    let tempArr = groupIndexObj[rowsList[i][j]];
                    let currentIndex = `${i}${j}`;
                    let previosIndex = `${i - 1}${j}`;
                    let nextIndex = `${i + 1}${j}`;
                    //console.log(`tempArr[0] ${tempArr[0]} currentIndex ${currentIndex} previosIndex ${previosIndex} nextIndex ${nextIndex}`)
                    let previousIndexFound = (tempArr.indexOf(previosIndex) != -1) ? true : false;
                    let nextIndexFound = (tempArr.indexOf(nextIndex) != -1) ? true : false;
                    //console.log(`tempArr[0] ${tempArr[0]} currentIndex ${currentIndex} previousIndexFound ${previousIndexFound} nextIndexFound ${nextIndexFound}`)

                    //to know about all sub patterns for specific group index value starts here...
                    let subArrChunck = [];
                    if (previousIndexFound) {
                        subArrChunck.push(previosIndex);
                    }
                    subArrChunck.push(currentIndex);
                    if (nextIndexFound) {
                        subArrChunck.push(nextIndex);
                        for (let lp1 = 0; lp1 < tempArr.length; lp1++) {
                            let num = lp1 + 2;
                            let nextTOnextIndex = `${i + num}${j}`;
                            if (tempArr.indexOf(nextTOnextIndex) != -1 && subArrChunck.indexOf(nextTOnextIndex) == -1) {
                                subArrChunck.push(nextTOnextIndex);
                            } else {
                                break;
                            }
                        }
                    }

                    //console.log(`subArrChunck `, subArrChunck);
                    //to know about all sub patterns for specific group index value ends here...

                    //apply row span 
                    //if(tempArr[0] == currentIndex){
                    if (subArrChunck[0] == currentIndex) {
                        cells.push(<td className="pdf-row" rowSpan={subArrChunck.length} >{ReactHtmlParser(rowsList[i][j])}</td>);
                    } else {

                    }
                } else {
                    cells.push(<td className="pdf-row">{ReactHtmlParser(rowsList[i][j])}</td>);
                }
                // cells.push(<td className="pdf-row">{ReactHtmlParser(rowsList[i][j])}</td>);
            }
            rows.push(<tr>{cells}</tr>)
        }
        return rows;
    }

    getTableGroupListObj = (groupName, tableGroupingList) => {
        for (let j = 0; j < tableGroupingList.length > 0; j++) {
            if (tableGroupingList[j].groupName == groupName) {
                return tableGroupingList[j];
            }
        }
        return {};
    }

    generateTableJSON = (arrObj, showFunction, showInterface, showRefNo, tableGroupingList) => {
        let headingsIndex = [];
        let tableArr = [];
        let tableObj = {};
        let newIndex;

        if (showFunction == true) {
            headingsIndex.push('Function');
        }
        if (showInterface == true) {
            headingsIndex.push('Interface');
        }
        if (showRefNo == true) {
            headingsIndex.push('Ref#');
        }
        for (let i = 0; i < arrObj.length; i++) {
            let staticColHeadArr = arrObj[i].staticColGroup || [];
            for (let j = 0; j < staticColHeadArr.length > 0; j++) {
                let staticGroupObj = this.getTableGroupListObj(staticColHeadArr[j], tableGroupingList)
                if (staticGroupObj.groupHeader && headingsIndex.includes(staticGroupObj.groupHeader) == false) {
                    headingsIndex.push(staticGroupObj.groupHeader);
                }
            }
        }

        for (let i = 0; i < arrObj.length; i++) {
            if (headingsIndex.includes(arrObj[i].columnHeading) == false) {
                headingsIndex.push(arrObj[i].columnHeading);
            }
        }

        for (let i = 0; i < arrObj.length; i++) {
            if (headingsIndex.includes(arrObj[i].resultHeading) == false) {
                headingsIndex.push(arrObj[i].resultHeading);
            }
        }



        tableObj.headings = headingsIndex;
        tableObj.values = [];

        // iteration for column heading labels
        for (let i = 0; i < arrObj.length; i++) {
            let headerValueIndex = headingsIndex.indexOf(arrObj[i].columnHeading);
            let tempValues = [];
            for (let j = 0; j < headingsIndex.length; j++) {
                if (j == headerValueIndex) {
                    tempValues.push(arrObj[i].label);
                } else {
                    tempValues.push('')
                }
            }
            tableObj.values.push(tempValues)
        }


        // iteration for result heading submitted values
        for (let i = 0; i < arrObj.length; i++) {

            if (showFunction) {
                tableObj.values[i][0] = arrObj[i].functionOptionValue;
            }
            if (showInterface) {
                if(showFunction)
                tableObj.values[i][1] = arrObj[i].interfaceOptionValue;
                else
                tableObj.values[i][0] = arrObj[i].interfaceOptionValue;
            }
            if (showRefNo && arrObj[i].index) {
                let tempIndex;
                if((showFunction && !showInterface) || (!showFunction && showInterface))
                tempIndex = 1;
                else if(showFunction && showInterface)
                tempIndex = 2
                else
                tempIndex = 0
                //let tempIndex = (showFunction) ? 1 : 0;
                newIndex = arrObj[i].index.replace('.', '');
                tableObj.values[i][tempIndex] = newIndex;
            }

            let headerValueIndex = headingsIndex.indexOf(arrObj[i].resultHeading);
            for (let j = 0; j < headingsIndex.length; j++) {
                if (j == headerValueIndex) {
                    if(arrObj[i].inputType == 'date'){
                        arrObj[i].value = moment(arrObj[i].value).format('MM/DD/YYYY');
                    }
                    tableObj.values[i][j] = arrObj[i].value;
                }
            }
            //tableObj.values.push(tempValues)
        }

        // iteration for static group column headings
        for (let i = 0; i < arrObj.length; i++) {

            let staticColHeadArr = arrObj[i].staticColGroup || [];
            let staticGroupObj;
            for (let k = 0; k < staticColHeadArr.length > 0; k++) {
                staticGroupObj = this.getTableGroupListObj(staticColHeadArr[k], tableGroupingList)
                let headerValueIndex = headingsIndex.indexOf(staticGroupObj.groupHeader);
                for (let j = 0; j < headingsIndex.length; j++) {
                    if (j == headerValueIndex) {
                        tableObj.values[i][j] = staticGroupObj.groupText;
                    }
                }
            }


            //tableObj.values.push(tempValues)
        }
        return tableObj;
    }

    generateTableJSON_Deficiency = (submitFormData, showFunction, showInterface) => {
        let headingsIndex = ['Item', 'Equip Tag (Ref#)', 'Description', 'Corrective Action', 'Corrected By', 'Corrected Date'];
        let tableArr = [];
        let tableObj = {};
        let newIndex;
        let combineDeficiencyLogs = submitFormData.combineDeficiencyLogs || [];
        let tabs = submitFormData.tabs || [];
        let DeficiencyLogsArray = [];
        let allCombineDefIds = [];

        for( let j=0; j < tabs.length; j++ ){
            if(tabs[j].tab == 'Deficiency logs'){
                DeficiencyLogsArray = tabs[j].elements;
            }

            if(tabs[j].tab == 'Combined Deficiency logs'){
                let elementsArr = tabs[j].elements;
                for(let i=0; i<elementsArr.length; i++){
                    let elem = elementsArr[i];
                    allCombineDefIds.push(elem._id);
                }
            }
        }

        if(showFunction && !showInterface){
            headingsIndex = ['Item', 'Function', 'Equip Tag (Ref#)', 'Description', 'Corrective Action', 'Corrected By', 'Corrected Date'];
        }else if(showFunction && showInterface){
            headingsIndex = ['Item', 'Function', 'Interface', 'Equip Tag (Ref#)', 'Description', 'Corrective Action', 'Corrected By', 'Corrected Date'];
        }else if(!showFunction && showInterface){
            headingsIndex = ['Item', 'Interface', 'Equip Tag (Ref#)', 'Description', 'Corrective Action', 'Corrected By', 'Corrected Date'];
        }

        tableObj.headings = headingsIndex;
        tableObj.values = [];
        let count = 0;
        let refNumArr = [];
        let allRefNumbers = [];

        // iteration for column heading labels
        for (let i = 0; i < combineDeficiencyLogs.length; i++) {
            let tempValues = [];
            let eqTagsArr = combineDeficiencyLogs[i].equipmentTagsArr;
            let uniqueeqTags = [...new Set(eqTagsArr)]; 
            refNumArr = combineDeficiencyLogs[i].referenceNumbers;
            let uniqueRefNum = [...new Set(refNumArr)]; 

            //Combine Equip  Tag & Ref #
            let myArr = [];
            eqTagsArr.forEach((tag, tagIndex) => {
                refNumArr.forEach((ref, refIndex) => {
                    if(tagIndex === refIndex){
                        myArr.push({[tag]: ref});
                    }
                })
            });
            
           let equipmentTagsAndRefNumArr = myArr.reduce((acc, curr) => {        
                const key = Object.keys(curr)[0]
                const found = acc.find(i => i[key])
                if (!found) {
                    acc.push(curr)
                } else {
                    found[key] = [ found[key], curr[key] ]
                }
                return acc;
            }, []).map(item =>  ` ${Object.keys(item)[0]} (${item[Object.keys(item)[0]]})`).toString()
            //End Combine Equip  Tag & Ref #

            let text1 = uniqueeqTags.toString();
            let text2 = uniqueRefNum.toString();
            let functionValuesArr = combineDeficiencyLogs[i].functionValues;
            let interfaceValuesArr = combineDeficiencyLogs[i].interfaceValues;
            let uniquefunctionValues = [...new Set(functionValuesArr)];
            let uniqueInterfaceValues = [...new Set(interfaceValuesArr)];
            count = count + 1;
            tempValues.push(count);
            if(showFunction){ 
                let functDisplayVal =  (uniquefunctionValues.length > 1 ) ? 'N/A' : uniquefunctionValues.toString();
                tempValues.push(functDisplayVal ) 
            }
            if(showInterface){ 
                let interfaceDisplayVal =  (uniqueInterfaceValues.length > 1 ) ? 'N/A' : uniqueInterfaceValues.toString();
                tempValues.push(interfaceDisplayVal ) 
            }

            // tempValues.push(text1);
            
            // let equipmentTagAndRefNumber = `${text1} (${_.sortBy(text2.split(','))})`;
            // console.log("========>", equipmentTagAndRefNumber)
            // tempValues.push(_.sortBy(text2.split(',')));
            tempValues.push(equipmentTagsAndRefNumArr)

              if (combineDeficiencyLogs[i+2].hasOwnProperty('correctedBy')) {
                tempValues.push(combineDeficiencyLogs[i].combinedDescription);
                tempValues.push(combineDeficiencyLogs[i+1].corrective_action || ''); 
                tempValues.push(combineDeficiencyLogs[i+2].correctedBy || '');
                tempValues.push((combineDeficiencyLogs[i+3].correctedAt ? (new Date(Date.parse(combineDeficiencyLogs[i+3].correctedAt))).toLocaleDateString('en-Us') : ''))
                i+=2; // GET THE EXECT CORRECTIVE ACTION VALUE FOR COMBINED DEFICIENCE , THIS USED BECAUSE ALWAYS CORRECTIVE ACTION FIELD COMING

            } else {
                tempValues.push(combineDeficiencyLogs[i].combinedDescription);
                tempValues.push(combineDeficiencyLogs[i+1].corrective_action || ''); 
                tempValues.push('');
                tempValues.push('')
            
                
                i++; // GET THE EXECT CORRECTIVE ACTION VALUE FOR COMBINED DEFICIENCE , THIS USED BECAUSE ALWAYS CORRECTIVE ACTION FIELD COMING
            }
            
            

            tableObj.values.push(tempValues)

            allRefNumbers.push(...eqTagsArr);
            i++; // INCREMENT AFTER GET THE EXECT CORRECTIVE ACTION VALUE
        }

        for (let i = 0; i < DeficiencyLogsArray.length; i++) {
            if(DeficiencyLogsArray[i].type != 'section'){
                let tempValues = [];
                let text1 = DeficiencyLogsArray[i].equipmentTag;
                let text2 = DeficiencyLogsArray[i].index;
                let theNum;
                if(text2 != null){
                    theNum = parseInt(text2.replace('.',''));
                }
                

                if( allCombineDefIds.includes(DeficiencyLogsArray[i]._id) == false){
                    //if(allRefNumbers.includes(text1) == false ){
                    count = count + 1;
                    tempValues.push(count);
                    if(showFunction){ 
                        let functDisplayVal =  (DeficiencyLogsArray[i].functionOptionValue ) ? DeficiencyLogsArray[i].functionOptionValue : 'N/A' ;
                        tempValues.push(functDisplayVal ) 
                    }
                    if(showInterface){ 
                        let interfaceDisplayVal =  (DeficiencyLogsArray[i].interfaceOptionValue ) ? DeficiencyLogsArray[i].interfaceOptionValue : 'N/A' ;
                        tempValues.push(interfaceDisplayVal) 
                    }
                    // tempValues.push(text1);
                    // let equipmentTagAndRefNumber = `${text1} (${theNum})`;
                    let equipmentTagAndRefNumber = text1 && theNum ? `${text1} (${theNum})` : text1 && !theNum ? `${text1}` : !text1 && theNum ? `(${theNum})` : '';
                    // tempValues.push(theNum);
                    tempValues.push(equipmentTagAndRefNumber);

                    
                    tempValues.push(DeficiencyLogsArray[i].description);
                    tempValues.push(DeficiencyLogsArray[i].corrective_action || '');
                    tempValues.push(DeficiencyLogsArray[i].correctedBy || '');
                    tempValues.push((DeficiencyLogsArray[i].correctedAt ? (new Date(Date.parse(DeficiencyLogsArray[i].correctedAt))).toLocaleDateString('en-Us') : ''))
                    
                    tableObj.values.push(tempValues)
                }

                
            }
        }

        return tableObj;
    }

    downloadReport = () => {/*
        this.setState({ reportDownloading: true })
        const ref = document.getElementById("reportDiv")

        html2Canvas(ref, {
            scale: 3,
        }).then(canvas => {
            const pdf = new jsPDF('p', 'mm', 'A4');
            const imgData = canvas.toDataURL('image/svg');
            pdf.addImage(imgData, 'SVG', 5, 10, 200, 285, undefined, 'FAST');
            pdf.save("Intellihood--" + this.state.s_date.format('YYYY-MM-DD') + ".pdf");
            this.setState({ reportDownloading: false })
        }).catch(error => {
            this.setState({ reportDownloading: false })
            console.log("Ops something went wrong", error)

        })*/
    }

    handleProgress = (count) => {
        this.setState({
            progress: count
        })
    }

    // Function to handle printing the entire report
    async generateAllPdf(PDFStructure) {

        this.setState({
            generatingPDF: true
        })

        const doc = new jsPDF('p', 'mm', 'letter', true);
       
        let ids = [];
        for (let k = 0; k < PDFStructure.length; k++) {
            ids.push(PDFStructure[k].ref);
        }


        const length = PDFStructure.length;
        for (let i = 0; i < length; i++) {
            let percent = Math.floor((i / length)*100) + '%'
            this.handleProgress(percent)
            const chart = document.getElementById(ids[i]);
            // excute this function then exit loop
            await html2Canvas(chart, { scale: 3, useCORS: true }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg',0.5);
                //doc.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 10, 50, 200, 150);
                doc.addImage(imgData, 'JPEG', 0, 22.6, 216, 279.4, undefined, 'FAST');
                if (i < (length - 1)) {
                    doc.addPage();
                }
            });
        }

        this.setState({
            generatingPDF: false
        })

        doc.save("MCX-" + Moment().format('YYYY-MM-DD') + ".pdf");
    }

    // Function to handle printing ONLY the def Log (with cover page)
    async generateDefLog(PDFStructure) {
        this.setState({
            generatingPDF: true
        })
        const doc = new jsPDF('p', 'mm', 'letter', true);
        let ids = [];
        //loops thru object and adds Def Log
        for (let i = 0; i < PDFStructure.length; i++) {
            for (let j = 0; j < PDFStructure[i].contents.length; j++) {
                for (let k = 0; k < PDFStructure[i].contents[j].contents.length; k++) {
                    if (PDFStructure[i].contents[j].contents[k].sectionType == 'DEFICIENCYLOG') {
                        ids.push(PDFStructure[i].ref)
                    }
                }
            }
        }

        if (ids.length == 0) {
            alert('No Deficiency Log found')
            this.setState({
                generatingPDF: false
            })
            return
        }

        const length = ids.length;
        for (let i = 0; i < length; i++) {
            let percent = Math.floor((i / length)*100) + '%'
            this.handleProgress(percent)
            const chart = document.getElementById(ids[i]);
            await html2Canvas(chart, { scale: 3, useCORS: true }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg',0.5);
                doc.addImage(imgData, 'JPEG', 0, 22.6, 216, 279.4, undefined, 'FAST');
                if (i < (length - 1)) {
                    doc.addPage();
                }
            });
        }

        this.setState({
            generatingPDF: false
        })
        
        doc.save("MCX-" + Moment().format('YYYY-MM-DD') + ".pdf");
    }

    async generateCustomPDF(PDFStructure) {

        this.setState({
            generatingPDF: true
        })
      
        const doc = new jsPDF('p', 'mm', 'letter', true);
        let ids = [];
        //loops thru object and adds Def Log
        for (let i = 0; i < PDFStructure.length; i++) {
            if (this.state.pageList.includes(PDFStructure[i].ref)) {
                ids.push(PDFStructure[i].ref)
            }
        }
        console.log(ids)

        const length = ids.length;
        for (let i = 0; i < length; i++) {
            let percent = Math.floor((i / length)*100) + '%'
            this.handleProgress(percent)
            const chart = document.getElementById(ids[i]);
            await html2Canvas(chart, { scale: 3, useCORS: true }).then((canvas) => {
                const imgData = canvas.toDataURL('image/jpeg',0.5);
                doc.addImage(imgData, 'JPEG', 0, 22.6, 216, 279.4, undefined, 'FAST');
                if (i < (length - 1)) {
                    doc.addPage();
                }
            });
        }


        this.setState({
            generatingPDF: false,
            pageList: []
        })
        
        doc.save("MCX-" + Moment().format('YYYY-MM-DD') + ".pdf");

    }

    printButton = (e) => {
        if (this.state.PDFStructure != null) {
            return (
                <>
                    <button className={`btn btn-primary btn-air`} onClick={(e) => { e.preventDefault(); this.generateAllPdf(this.state.PDFStructure); }} >
                        Print PDF
                    </button>
                </>);
        } else {
            return null;
        }
    }

    printDefLogButton = () => {
        return (
            <>
                <button className={`btn btn-primary btn-air`} onClick={(e) => {this.generateDefLog(this.state.PDFStructure)}} >
                    Print Deficiency Log
                </button>
            </>
        )
    }

    printCustomButton = () => {
        return (
            <>
                <button className='btn btn-primary btn-air' onClick={() => this.setState({
                    showPages: true
                })}>
                    Print Custom Pages
                </button>
            </>
        )
    }



    setGroupingIndex = (table) => {
        let valuesArr = (table.values) ? table.values : [];
        let groupIndexObj = {};

        for (let i = 0; i < valuesArr.length; i++) {
            let innerArr = valuesArr[i];
            for (let j = 0; j < innerArr.length; j++) {
                let str = `${i}${j}`;
                if (innerArr[j] != '') {
                    if (groupIndexObj.hasOwnProperty(innerArr[j])) {
                        let tempArr = groupIndexObj[innerArr[j]];
                        groupIndexObj[innerArr[j]].push(str);
                    } else {
                        let tempArr = [str];
                        groupIndexObj = { ...groupIndexObj, [innerArr[j]]: tempArr };
                    }
                }

            }
        }
        //console.log('groupIndexObj', groupIndexObj);
        return groupIndexObj;
    }

    handleCheck = e => {
        let updatedList = [...this.state.pageList]
        if (e.target.checked) {
            updatedList = [...this.state.pageList, e.target.value]
        } else {
            updatedList.splice(this.state.pageList.indexOf(e.target.value), 1)
        }
        this.setState({pageList: updatedList})
    }


    render() {
        // Conditionally calles extractElement based on whether or not we have submitFormData (generating from submission or design level)
        if (Object.keys(this.props.submitFormData) != 0 ) { 
            this.extractElements(this.props.submitFormData);
        }
        let modalBody;
        // let { site } = this.props.siteData
        if (this.state.loader) {
            modalBody = <div className="report-chart-headings">
                <PulseLoader
                    widthUnit={"%"}
                    width={10}
                    height={1.5}
                    color={'#68bc45'}
                />
                <h4 className="ml-20">Generating PDF report print preview. Please wait...</h4>
            </div>
        } else if (this.state.generatingPDF) {
            modalBody = 
                <>
                <div className="mt-30 report-chart-headings">
                <PulseLoader
                    widthUnit={"%"}
                    width={10}
                    height={1.5}
                    color={'#68bc45'}
                />
                <h4>Generating PDF... {this.state.progress}</h4>
            </div>
            <div>
                <div>{this.createCharts()}</div> 
            </div>
            </>
        }else if (this.state.showPages) {
            modalBody = (
                <>
                    <div>
                        <h3>Please select desired pages:</h3>
                        {this.state.PDFStructure.map((item, i) => (
                            <ul style={{listStyleType: 'none'}}>
                                <li key={i}>
                                <label><input style={{marginRight: '5px'}} value={item.ref} type='checkbox' onClick={(e)=>this.handleCheck(e)}/>{item.title}</label>
                                </li>
                            </ul>
                        ))}
                    </div>
                    <div className='pdf-print-btndiv'>
                        <button style={{margin: '10px'}}  className='btn btn-primary btn-air' onClick={() => this.generateCustomPDF(this.state.PDFStructure) }>Print PDF</button>
                        <button className='btn btn-primary btn-air' onClick={() => this.setState({ showPages: false, pageList: []})}>Back</button>
                    </div>
                    <div>{this.createCharts()}</div>
                </>
            )
        } else {
            modalBody = (
                <div>
                    <div className='pdf-print-btndiv' style={{position: 'sticky', top: '0', zIndex: '1000'}}>{(this.state.PDFStructure != null) ? this.printButton() : null}</div>
                    <div className='pdf-print-btndiv' style={{position: 'sticky', top: '0', zIndex: '1000'}}>{(this.state.PDFStructure != null) ? this.printDefLogButton() : null}</div>
                    <div className='pdf-print-btndiv' style={{position: 'sticky', top: '0', zIndex: '1000'}}>{(this.state.PDFStructure != null) ? this.printCustomButton() : null}</div>
                    <div>{this.createCharts()}</div> 
                </div>
            )

        }
        return modalBody;

    }
    
    setImages = (submittedObject, PDFStructure) => {
        let PDFSt = _.cloneDeep( PDFStructure );
        let elements = [], images = [];
        submittedObject.tabs.map((tab) => {
            elements.push(...(tab.elements));
        })
        let pageIndex = 0;
        PDFSt.map((e1) => {
            let imageCount = 0;
            pageIndex++
            e1.contents.map((e2) => {
                e2.contents.map((e3) => {
                    if (e3.imageSectionType && e3.imageSectionType == 'grid') {

                        e3.contents.map((e4) => {
                           // console.log("elem", e4);
                            elements.filter((elem) => {
                                if (elem._id === e4._id && elem.type == 'image') {

                                    //e4.value = elem.value
                                    if (elem.value != "") {

                                        elem.value.map((v) => {

                                            imageCount++;
                                            
                                            images.push({ _id: elem._id, img: v, label: elem.label, index: elem.index});                                                                         
                                            if (imageCount > 6) {
                                                PDFSt = this.addNewPage(_.cloneDeep(e1),_.cloneDeep(e2),_.cloneDeep(e3),_.cloneDeep(e3.contents), _.cloneDeep(PDFSt), pageIndex - 1);
                                                imageCount = 1;
                                            }
                                        })

                                    }
                                }
                            })
                            
                        })
                    }
                })
            })

        })
        this.setState({
            images:_.cloneDeep(images)
        })
      //  console.log("extract pdf", PDFStructure)
        return PDFSt;
    }

    extractElements = (submittedObject) => {
        let elements = [],imageIndex = 0;
        submittedObject.tabs.map((tab) => {
            elements.push(...(tab.elements));
        })
        this.state.PDFStructure.map((e1) => {
            e1.contents.map((e2) => {
                e2.contents.map((e3) => {
                    if (e3.sectionType != 'IMAGE' || e3.imageSectionType != 'grid') {
                        e3.contents.map((e4) => {
                            //console.log("elem", e4);
                            elements.filter((elem) => {
                                if (elem._id === e4._id) {
                                    e4.value = elem.value
                                }
                            })
                        })
                    } else {
                        let count = 0; let contents = [];
                        for (let i = imageIndex; i < this.state.images.length; i++) {
                            if (count < 6) {
                                if (e3.contents.filter(img => img._id == this.state.images[i]._id)) {
                                    let elem = _.cloneDeep(e3.contents[0]);
                                    const random = Math.random().toString().substr(2, 6)
                                    const tempID = (Date.now() + '')
                                    const newID =  random
                                    elem.id = newID
                                    elem.label = this.state.images[i].label;
                                    elem.index = this.state.images[i].index;
                                    elem.value = [];
                                    elem.value.push(this.state.images[i].img);
                                    contents.push({ ...elem })
                                    count++;
                                }
                            } else {
                                imageIndex = i;
                                break;
                            }

                        }
                        e3.contents = contents;

                    }
                })
            })
        })
        //console.log("updated", this.state.PDFStructure);
    }
}

const mapStateToProps = (state) => {
    // return { generateReportFile: state.generateReportFile }
    return {}
}

const mapDispatchToProps = (dispatch) => ({ dispatch })


export default connect(mapStateToProps, mapDispatchToProps)(SubmissionPDFView)
