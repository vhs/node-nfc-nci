#ifndef NODE_NFC_NCI_NODEINTERFACE_H
#define NODE_NFC_NCI_NODEINTERFACE_H

#include <string>
#include <exception>
#include <napi.h>
#include "tagmanager.h"
#include "tag.h"
#include "mutex.h"

class NodeInterface : public ITagManager
{
public:
    NodeInterface();
    ~NodeInterface();

    void setNextWrite(const Napi::CallbackInfo& info);
    void clearNextWrite(const Napi::CallbackInfo& info);
    Napi::Boolean hasNextWrite(const Napi::CallbackInfo& info);
    void immediateWrite(const Napi::CallbackInfo& info);

    void onTagArrived(Tag::Tag* tag);
    void onTagDeparted();
    void onTagWritten(Tag::Tag* tag);
    void onError(std::string message);
};

extern NodeInterface* nodei;

#endif // NODE_NFC_NCI_NODEINTERFACE_H
